import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { getEffectivePrice } from "@/lib/product-price";
import { normalizePhone } from "@/lib/phone";

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
      include: { productA: true, productB: true },
    });
    if (!deal) return jsonError("הדיל לא זמין או שפג תוקף");

    const redeemed = await prisma.dealRedemption.findUnique({
      where: { dealId_customerPhone: { dealId: deal.id, customerPhone: phone } },
    });
    if (redeemed) return jsonError("כבר מימשת את הדיל הזה פעם אחת");

    const a = deal.productA;
    const b = deal.productB;
    if (!a.isActive || !b.isActive) return jsonError("מוצר בדיל לא זמין");

    const effA = getEffectivePrice(a);
    const effB = getEffectivePrice(b);
    const sum = effA + effB;
    const priceA = sum > 0 ? (deal.dealPrice * effA) / sum : deal.dealPrice / 2;
    const priceB = deal.dealPrice - priceA;

    orderItems = [
      { productId: a.id, quantity: 1, priceAtOrder: priceA },
      { productId: b.id, quantity: 1, priceAtOrder: priceB },
    ];

    const order = await prisma.order.create({
      data: {
        businessId: business.id,
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        customerEmail: parsed.data.customerEmail || null,
        notes: parsed.data.notes
          ? `${parsed.data.notes} [דיל: ${deal.name}]`
          : `[דיל: ${deal.name}]`,
        items: { create: orderItems },
      },
      include: { items: true },
    });

    await prisma.dealRedemption.create({
      data: { dealId: deal.id, customerPhone: phone },
    });

    return jsonOk({ orderId: order.id, dealApplied: true });
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

  const order = await prisma.order.create({
    data: {
      businessId: business.id,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail || null,
      notes: parsed.data.notes,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  return jsonOk({ orderId: order.id });
}
