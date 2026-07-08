import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { getEffectivePrice } from "@/lib/product-price";
import { getDealLines, splitDealPrice } from "@/lib/store-deal";
import {
  computeCouponDiscount,
  couponInvalidOrExpiredError,
  couponMinOrderError,
  couponRedemptionLimitError,
  isCouponPerCustomerLimitReached,
  isCouponTotalLimitReached,
} from "@/lib/coupon-redemption";
import {
  INVALID_PHONE_MESSAGE_HE,
  parseIsraeliMobilePhone,
} from "@/lib/phone";
import { customerPhoneSchema } from "@/lib/validation/schemas";
import {
  isWithinOrderSchedule,
  ORDER_SCHEDULE_CLOSED_MESSAGE,
} from "@/lib/order-schedule";
import {
  canFulfillQuantity,
  isProductInStock,
  OUT_OF_STOCK_MESSAGE,
} from "@/lib/product-stock";
import {
  OrderStockError,
  reserveStockAndCreateOrder,
} from "@/lib/product-stock-order";
import {
  notifyLowStockAfterOrder,
  notifySellerNewOrder,
} from "@/lib/seller-push";
import { storePanelsFromBusiness } from "@/lib/store-panels-visible";
import {
  dealRedemptionLimitError,
  isDealRedemptionLimitReached,
} from "@/lib/store-deal-redemption";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  getPlatformLimits,
  orderItemsLimitMessage,
  totalOrderItemQuantity,
} from "@/lib/platform-limits";
import { assertCanAcceptCustomerBooking } from "@/lib/subscription-usage";
import { requireCustomerGoogleAccess } from "@/lib/customer-google-access";
import { mapPublicOrdersToHistory } from "@/lib/public-customer-orders";

function afterOrderPlaced(
  businessId: string,
  order: { id: string; customerName: string },
  lines: { productId: string; quantity: number }[]
) {
  void notifySellerNewOrder(businessId, order);
  void notifyLowStockAfterOrder(businessId, lines);
}
const schema = z.object({
  customerName: z.string().min(2).max(80),
  customerPhone: customerPhoneSchema,
  customerEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
  dealId: z.string().optional(),
  couponCode: z.string().max(30).optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(100),
      })
    )
    .optional(),
});

function orderStatusLabelHe(status: string): string {
  switch (status) {
    case "CONFIRMED":
      return "אושר";
    case "COMPLETED":
      return "הושלם";
    case "CANCELLED":
      return "בוטל";
    default:
      return "ממתין לאישור";
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:orders:get:${slug.toLowerCase()}`,
    30,
    10 * 60 * 1000
  );
  if (limited) return limited;

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { id: true, type: true, isActive: true, storeLocale: true },
  });
  if (!business || !business.isActive) return jsonError("עסק לא נמצא", 404);
  if (business.type !== "STORE") {
    return jsonError("עסק זה אינו מקבל הזמנות", 400);
  }

  const access = await requireCustomerGoogleAccess(business.id);
  if (access instanceof NextResponse) return access;

  const orders = await prisma.order.findMany({
    where: {
      businessId: business.id,
      customerEmail: { equals: access.email, mode: "insensitive" },
    },
    include: {
      items: {
        include: {
          product: { select: { name: true, imageUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const label =
    business.storeLocale === "en"
      ? (status: string) => {
          switch (status) {
            case "CONFIRMED":
              return "Confirmed";
            case "COMPLETED":
              return "Completed";
            case "CANCELLED":
              return "Cancelled";
            default:
              return "Pending";
          }
        }
      : orderStatusLabelHe;

  return jsonOk({ orders: mapPublicOrdersToHistory(orders, label) });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const limited = await enforceRateLimit(
    req,
    `public:orders:${slug.toLowerCase()}`,
    10,
    10 * 60 * 1000
  );
  if (limited) return limited;

  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    include: { products: { where: { isActive: true } } },
  });

  if (!business) return jsonError("עסק לא נמצא", 404);

  const bookingCheck = await assertCanAcceptCustomerBooking(
    business,
    business.storeLocale === "he" ? "he" : "en"
  );
  if (!bookingCheck.ok) return jsonError(bookingCheck.message, 403);

  if (business.type !== "STORE") return jsonError("עסק זה אינו מקבל הזמנות", 400);

  const panels = storePanelsFromBusiness(business);
  const scheduleEnabled =
    panels.orderLimits && (business.orderScheduleEnabled ?? false);
  if (!isWithinOrderSchedule(scheduleEnabled, business.orderSchedule)) {
    return jsonError(ORDER_SCHEDULE_CLOSED_MESSAGE, 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const phone = parseIsraeliMobilePhone(parsed.data.customerPhone);
  if (!phone) return jsonError(INVALID_PHONE_MESSAGE_HE);

  const { maxOrderItemsPerOrder } = await getPlatformLimits();

  let orderItems: { productId: string; quantity: number; priceAtOrder: number }[] = [];

  if (parsed.data.dealId) {
    if (!panels.deals) return jsonError("מבצעים לא זמינים בחנות זו", 403);
    const deal = await prisma.storeDeal.findFirst({
      where: {
        id: parsed.data.dealId,
        businessId: business.id,
        isActive: true,
        validUntil: { gt: new Date() },
      },
      include: {
        items: { include: { product: true }, orderBy: { sortOrder: "asc" } },
        productA: true,
        productB: true,
      },
    });
    if (!deal) return jsonError("הדיל לא זמין או שפג תוקף");

    const redemptionCount = await prisma.dealRedemption.count({
      where: { dealId: deal.id, customerPhone: phone },
    });
    const maxRedemptions = deal.maxRedemptionsPerCustomer ?? 1;
    if (isDealRedemptionLimitReached(maxRedemptions, redemptionCount)) {
      return jsonError(dealRedemptionLimitError(maxRedemptions));
    }

    const dealLines = getDealLines(deal);
    if (dealLines.length < 1) return jsonError("דיל לא תקין");
    if (dealLines.some((line) => !line.product.isActive)) {
      return jsonError("מוצר בדיל לא זמין");
    }
    if (
      dealLines.some(
        (line) => !canFulfillQuantity(line.product.stock, line.quantity)
      )
    ) {
      return jsonError(OUT_OF_STOCK_MESSAGE);
    }

    const split = splitDealPrice(deal.dealPrice, dealLines);
    orderItems = split.map((row) => ({
      productId: row.productId,
      quantity: row.quantity,
      priceAtOrder: row.priceAtOrder,
    }));

    if (totalOrderItemQuantity(orderItems) > maxOrderItemsPerOrder) {
      return jsonError(orderItemsLimitMessage(maxOrderItemsPerOrder), 403);
    }

    try {
      const order = await prisma.$transaction(async (tx) => {
        const created = await reserveStockAndCreateOrder(
          tx,
          business.id,
          orderItems,
          {
            customerName: parsed.data.customerName,
            customerPhone: phone,
            customerEmail: parsed.data.customerEmail || null,
            notes: parsed.data.notes
              ? `${parsed.data.notes} [דיל: ${deal.name}]`
              : `[דיל: ${deal.name}]`,
          }
        );
        await tx.dealRedemption.create({
          data: { dealId: deal.id, customerPhone: phone },
        });
        return created;
      });
      afterOrderPlaced(
        business.id,
        { id: order.id, customerName: order.customerName },
        orderItems
      );
      return jsonOk({ orderId: order.id, orderNumber: order.orderNumber, dealApplied: true });
    } catch (e) {
      if (e instanceof OrderStockError) return jsonError(e.message);
      throw e;
    }
  }

  const items = parsed.data.items ?? [];
  if (items.length < 1) return jsonError("אין פריטים בהזמנה");

  for (const item of items) {
    const product = business.products.find((p) => p.id === item.productId);
    if (!product) return jsonError("מוצר לא תקין");
    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      priceAtOrder: getEffectivePrice(product),
    });
  }

  if (totalOrderItemQuantity(orderItems) > maxOrderItemsPerOrder) {
    return jsonError(orderItemsLimitMessage(maxOrderItemsPerOrder), 403);
  }

  const orderLocale = business.storeLocale === "en" ? "en" : "he";
  let couponId: string | undefined;
  let couponCode: string | undefined;
  let discountAmount = 0;

  if (parsed.data.couponCode) {
    const coupon = await prisma.coupon.findFirst({
      where: {
        businessId: business.id,
        code: parsed.data.couponCode.toUpperCase(),
        isActive: true,
        OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
      },
    });
    if (!coupon) return jsonError(couponInvalidOrExpiredError(orderLocale));

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.priceAtOrder * item.quantity,
      0
    );
    if (coupon.minOrderAmount != null && subtotal < coupon.minOrderAmount) {
      return jsonError(couponMinOrderError(coupon.minOrderAmount, orderLocale));
    }

    const [perCustomerCount, totalCount] = await Promise.all([
      prisma.couponRedemption.count({
        where: { couponId: coupon.id, customerPhone: phone },
      }),
      prisma.couponRedemption.count({ where: { couponId: coupon.id } }),
    ]);
    if (
      isCouponPerCustomerLimitReached(
        coupon.maxRedemptionsPerCustomer,
        perCustomerCount
      ) ||
      isCouponTotalLimitReached(coupon.maxRedemptions, totalCount)
    ) {
      return jsonError(couponRedemptionLimitError(orderLocale));
    }

    couponId = coupon.id;
    couponCode = coupon.code;
    discountAmount = computeCouponDiscount(coupon, subtotal);
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await reserveStockAndCreateOrder(tx, business.id, orderItems, {
        customerName: parsed.data.customerName,
        customerPhone: phone,
        customerEmail: parsed.data.customerEmail || null,
        notes: parsed.data.notes,
        ...(couponId && {
          couponId,
          couponCode,
          discountAmount,
        }),
      });
      if (couponId) {
        await tx.couponRedemption.create({
          data: { couponId, customerPhone: phone, orderId: created.id },
        });
      }
      return created;
    });
    afterOrderPlaced(
      business.id,
      { id: order.id, customerName: order.customerName },
      orderItems
    );
    return jsonOk({ orderId: order.id, orderNumber: order.orderNumber });
  } catch (e) {
    if (e instanceof OrderStockError) return jsonError(e.message);
    throw e;
  }
}
