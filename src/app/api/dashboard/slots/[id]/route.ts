import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("אין עסק", 404);
  const { id } = await params;

  const slot = await prisma.appointmentSlot.findFirst({
    where: { id, businessId: user.business.id },
  });
  if (!slot) return jsonError("תור לא נמצא", 404);

  await prisma.appointmentSlot.delete({ where: { id } });
  return jsonOk({ ok: true });
}
