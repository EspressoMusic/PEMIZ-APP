import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { findOwnedFaq } from "@/lib/security/ownership";

const patchSchema = z.object({
  question: z.string().trim().min(1).max(300).optional(),
  answer: z.string().trim().min(1).max(2000).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
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

  const existing = await findOwnedFaq(ctx.user.business.id, id);
  if (!existing) return jsonError("לא נמצא", 404);

  const item = await prisma.faqItem.update({
    where: { id, businessId: ctx.user.business.id },
    data: parsed.data,
  });
  return jsonOk({ item });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;

  const existing = await findOwnedFaq(ctx.user.business.id, id);
  if (!existing) return jsonError("לא נמצא", 404);

  await prisma.faqItem.delete({
    where: { id, businessId: ctx.user.business.id },
  });
  return jsonOk({ ok: true });
}
