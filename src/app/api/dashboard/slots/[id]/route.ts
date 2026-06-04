import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { findOwnedSlot } from "@/lib/security/ownership";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;

  const slot = await findOwnedSlot(ctx.user.business.id, id);
  if (!slot) return jsonError("תור לא נמצא", 404);

  await prisma.appointmentSlot.delete({
    where: { id, businessId: ctx.user.business.id },
  });
  return jsonOk({ ok: true });
}
