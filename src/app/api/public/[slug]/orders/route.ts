import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { getEffectivePrice } from "@/lib/product-price";
import { getDealLines, splitDealPrice } from "@/lib/store-deal";
import { normalizePhone } from "@/lib/phone";
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
  customerPhone: z.string().min(9).max(20),
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
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    include: { products: { where: { isActive: true } } },
  });

  if (!business) return jsonError("עסק לא נמצא", 404);
  if (!business.isActive) return jsonError("This business is currently unavailable.", 403);
  if (business.type !== "STORE") return jsonError("עסק זה אינו מקבל הזמנות", 400);

  if (
    !isWithinOrderSchedule(
      business.orderScheduleEnabled,
      business.orderSchedule
    )
  ) {
    return jsonError(ORDER_SCHEDULE_CLOSED_MESSAGE, 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const phone = normalizePhone(parsed.data.customerPhone);
  if (phone.length < 9) return jsonError("מספר טלפון לא תקין");

  let orderItems: { productId: string; quantity: number; priceAtOrder: number }[] = [];

  if (parsed.data.dealId) {
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

    const redeemed = await prisma.dealRedemption.findUnique({
      where: { dealId_customerPhone: { dealId: deal.id, customerPhone: phone } },
    });
    if (redeemed) return jsonError("כבר מימשת את הדיל הזה פעם אחת");

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

    try {
      const order = await prisma.$transaction(async (tx) => {
        const created = await reserveStockAndCreateOrder(
          tx,
          business.id,
          orderItems,
          {
            customerName: parsed.data.customerName,
            customerPhone: parsed.data.customerPhone,
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

  try {
    const order = await prisma.$transaction(async (tx) =>
      reserveStockAndCreateOrder(tx, business.id, orderItems, {
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        customerEmail: parsed.data.customerEmail || null,
        notes: parsed.data.notes,
      })
    );
    afterOrderPlaced(
      business.id,
      { id: order.id, customerName: order.customerName },
      orderItems
    );
    return jsonOk({ orderId: order.id });
  } catch (e) {
    if (e instanceof OrderStockError) return jsonError(e.message);
    throw e;
  }
}
