import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { getEffectivePrice } from "@/lib/product-price";
import { getDealLines, splitDealPrice } from "@/lib/store-deal";
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
import { grantCustomerPhoneAccess } from "@/lib/customer-phone-access";
import {
  getPlatformLimits,
  orderItemsLimitMessage,
  totalOrderItemQuantity,
} from "@/lib/platform-limits";
import { assertCanAcceptCustomerBooking } from "@/lib/subscription-usage";

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
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .optional(),
});

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
      await grantCustomerPhoneAccess(business.id, phone);
      return jsonOk({ orderId: order.id, dealApplied: true });
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

  try {
    const order = await prisma.$transaction(async (tx) =>
      reserveStockAndCreateOrder(tx, business.id, orderItems, {
        customerName: parsed.data.customerName,
        customerPhone: phone,
        customerEmail: parsed.data.customerEmail || null,
        notes: parsed.data.notes,
      })
    );
    afterOrderPlaced(
      business.id,
      { id: order.id, customerName: order.customerName },
      orderItems
    );
    await grantCustomerPhoneAccess(business.id, phone);
    return jsonOk({ orderId: order.id });
  } catch (e) {
    if (e instanceof OrderStockError) return jsonError(e.message);
    throw e;
  }
}
