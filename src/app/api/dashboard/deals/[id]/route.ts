import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { getDealProducts } from "@/lib/store-deal";

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().min(1).max(120).optional(),
  productIds: z.array(z.string()).min(1).optional(),
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
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("אין עסק", 404);
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const existing = await prisma.storeDeal.findFirst({
    where: { id, businessId: user.business.id },
  });
  if (!existing) return jsonError("דיל לא נמצא", 404);

  if (parsed.data.productIds) {
    const uniqueIds = [...new Set(parsed.data.productIds)];
    if (uniqueIds.length !== parsed.data.productIds.length) {
      return jsonError("אותו מוצר לא יכול להופיע פעמיים בדיל");
    }
    const products = await prisma.product.findMany({
      where: {
        businessId: user.business.id,
        id: { in: uniqueIds },
        isActive: true,
      },
    });
    if (products.length !== uniqueIds.length) {
      return jsonError("מוצר לא תקין או לא פעיל");
    }
  }

  const deal = await prisma.$transaction(async (tx) => {
    if (parsed.data.productIds) {
      await tx.storeDealItem.deleteMany({ where: { dealId: id } });
      await tx.storeDealItem.createMany({
        data: parsed.data.productIds.map((productId, sortOrder) => ({
          dealId: id,
          productId,
          sortOrder,
        })),
      });
    }

    return tx.storeDeal.update({
      where: { id },
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
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("אין עסק", 404);
  const { id } = await params;

  const existing = await prisma.storeDeal.findFirst({
    where: { id, businessId: user.business.id },
  });
  if (!existing) return jsonError("דיל לא נמצא", 404);

  await prisma.storeDeal.delete({ where: { id } });
  return jsonOk({ ok: true });
}
