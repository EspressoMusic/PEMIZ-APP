import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { findOwnedInquiry } from "@/lib/security/ownership";

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

  const existing = await findOwnedInquiry(ctx.user.business.id, id);
  if (!existing) return jsonError("פנייה לא נמצאה", 404);

  const inquiry = await prisma.inquiry.update({
    where: { id, businessId: ctx.user.business.id },
    data: {
      sellerReply: parsed.data.sellerReply.trim(),
      sellerReplyAt: new Date(),
    },
  });

  return jsonOk({ inquiry });
}
