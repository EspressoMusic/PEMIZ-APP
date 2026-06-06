import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";
import { getDealProducts, MAX_DEAL_PRODUCT_LINES } from "@/lib/store-deal";

const dealItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99),
});

const schema = z.object({
  name: z.string().min(1).max(120),
  items: z.array(dealItemSchema).min(1).max(MAX_DEAL_PRODUCT_LINES),
  dealPrice: z.number().positive(),
  validUntil: z.string().datetime(),
});

const dealInclude = {
  items: { include: { product: true }, orderBy: { sortOrder: "asc" as const } },
  productA: true,
  productB: true,
  _count: { select: { redemptions: true } },
};

function serializeDeal(
  deal: Parameters<typeof getDealProducts>[0] & Record<string, unknown>
) {
  const products = getDealProducts(deal);
  return { ...deal, products };
}

export async function GET() {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;

  const deals = await prisma.storeDeal.findMany({
    where: { businessId: ctx.user.business.id },
    include: dealInclude,
    orderBy: { createdAt: "desc" },
  });
  return jsonOk({ deals: deals.map((d) => serializeDeal(d)) });
}

export async function POST(req: Request) {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const productIds = parsed.data.items.map((item) => item.productId);
  const uniqueIds = [...new Set(productIds)];
  if (uniqueIds.length !== productIds.length) {
    return jsonError("אותו מוצר לא יכול להופיע פעמיים בדיל");
  }

  const products = await prisma.product.findMany({
    where: {
      businessId: ctx.user.business.id,
      id: { in: uniqueIds },
      isActive: true,
    },
  });
  if (products.length !== uniqueIds.length) {
    return jsonError("מוצר לא תקין או לא פעיל");
  }

  const deal = await prisma.storeDeal.create({
    data: {
      businessId: ctx.user.business.id,
      name: parsed.data.name,
      dealPrice: parsed.data.dealPrice,
      validUntil: new Date(parsed.data.validUntil),
      items: {
        create: parsed.data.items.map((item, sortOrder) => ({
          productId: item.productId,
          quantity: item.quantity,
          sortOrder,
        })),
      },
    },
    include: dealInclude,
  });
  return jsonOk({ deal: serializeDeal(deal) });
}
