import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { findOwnedReview } from "@/lib/security/ownership";

const patchSchema = z.object({
  sellerReply: z.string().trim().min(1).max(2000),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const existing = await findOwnedReview(ctx.user.business.id, id);
  if (!existing) return jsonError("ביקורת לא נמצאה", 404);

  const review = await prisma.storeReview.update({
    where: { id, businessId: ctx.user.business.id },
    data: {
      sellerReply: parsed.data.sellerReply.trim(),
      sellerReplyAt: new Date(),
    },
  });

  return jsonOk({ review });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const { id } = await params;
  const existing = await findOwnedReview(ctx.user.business.id, id);
  if (!existing) return jsonError("ביקורת לא נמצאה", 404);

  await prisma.storeReview.delete({
    where: { id, businessId: ctx.user.business.id },
  });

  return jsonOk({ ok: true });
}
