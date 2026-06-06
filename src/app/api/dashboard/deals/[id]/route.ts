import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";
import { findOwnedDeal } from "@/lib/security/ownership";
import { getDealProducts, MAX_DEAL_PRODUCT_LINES } from "@/lib/store-deal";

const dealItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1).max(99),
});

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(120).optional(),
  items: z
    .array(dealItemSchema)
    .min(1)
    .max(MAX_DEAL_PRODUCT_LINES)
    .optional(),
  dealPrice: z.number().positive().optional(),
  validUntil: z.string().datetime().optional(),
});

const dealInclude = {
  items: { include: { product: true }, orderBy: { sortOrder: "asc" as const } },
  productA: true,
  productB: true,
  _count: { select: { redemptions: true } },
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const existing = await findOwnedDeal(ctx.user.business.id, id);
  if (!existing) return jsonError("דיל לא נמצא", 404);

  if (parsed.data.items) {
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
  }

  const deal = await prisma.$transaction(async (tx) => {
    if (parsed.data.items) {
      await tx.storeDealItem.deleteMany({ where: { dealId: id } });
      await tx.storeDealItem.createMany({
        data: parsed.data.items.map((item, sortOrder) => ({
          dealId: id,
          productId: item.productId,
          quantity: item.quantity,
          sortOrder,
        })),
      });
    }

    return tx.storeDeal.update({
      where: { id, businessId: ctx.user.business.id },
      data: {
        ...(parsed.data.isActive !== undefined && {
          isActive: parsed.data.isActive,
        }),
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.dealPrice !== undefined && {
          dealPrice: parsed.data.dealPrice,
        }),
        ...(parsed.data.validUntil !== undefined && {
          validUntil: new Date(parsed.data.validUntil),
        }),
      },
      include: dealInclude,
    });
  });

  return jsonOk({ deal: { ...deal, products: getDealProducts(deal) } });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;

  const existing = await findOwnedDeal(ctx.user.business.id, id);
  if (!existing) return jsonError("דיל לא נמצא", 404);

  await prisma.storeDeal.delete({
    where: { id, businessId: ctx.user.business.id },
  });
  return jsonOk({ ok: true });
}
