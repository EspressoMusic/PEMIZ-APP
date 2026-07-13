import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";
import { findOwnedCoupon } from "@/lib/security/ownership";

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  discountValue: z.number().positive().optional(),
  minOrderAmount: z.number().positive().nullable().optional(),
  maxRedemptions: z.number().int().positive().nullable().optional(),
  maxRedemptionsPerCustomer: z.number().int().min(0).max(99).optional(),
  validUntil: z.string().datetime().nullable().optional(),
  autoGrantOnReview: z.boolean().optional(),
});

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

  const existing = await findOwnedCoupon(ctx.user.business.id, id);
  if (!existing) return jsonError("קופון לא נמצא", 404);

  if (
    existing.discountType === "PERCENTAGE" &&
    parsed.data.discountValue !== undefined &&
    parsed.data.discountValue > 100
  ) {
    return jsonError("אחוז הנחה לא יכול לעלות על 100");
  }

  const coupon = await prisma.$transaction(async (tx) => {
    // Only one coupon per business can be the auto-granted review reward.
    if (parsed.data.autoGrantOnReview) {
      await tx.coupon.updateMany({
        where: {
          businessId: ctx.user.business.id,
          autoGrantOnReview: true,
          id: { not: id },
        },
        data: { autoGrantOnReview: false },
      });
    }
    return tx.coupon.update({
      where: { id, businessId: ctx.user.business.id },
      data: {
        ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
        ...(parsed.data.discountValue !== undefined && {
          discountValue: parsed.data.discountValue,
        }),
        ...(parsed.data.minOrderAmount !== undefined && {
          minOrderAmount: parsed.data.minOrderAmount,
        }),
        ...(parsed.data.maxRedemptions !== undefined && {
          maxRedemptions: parsed.data.maxRedemptions,
        }),
        ...(parsed.data.maxRedemptionsPerCustomer !== undefined && {
          maxRedemptionsPerCustomer: parsed.data.maxRedemptionsPerCustomer,
        }),
        ...(parsed.data.validUntil !== undefined && {
          validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
        }),
        ...(parsed.data.autoGrantOnReview !== undefined && {
          autoGrantOnReview: parsed.data.autoGrantOnReview,
        }),
      },
      include: { _count: { select: { redemptions: true } } },
    });
  });

  return jsonOk({ coupon });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;

  const existing = await findOwnedCoupon(ctx.user.business.id, id);
  if (!existing) return jsonError("קופון לא נמצא", 404);

  await prisma.coupon.delete({
    where: { id, businessId: ctx.user.business.id },
  });
  return jsonOk({ ok: true });
}
