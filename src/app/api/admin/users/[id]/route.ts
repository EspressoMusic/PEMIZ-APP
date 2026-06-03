import { prisma } from "@/lib/prisma";
import { hasPlatformAdminAccess } from "@/lib/admin-access";
import { jsonError, jsonOk } from "@/lib/api";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasPlatformAdminAccess())) return jsonError("אין הרשאה", 403);

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { business: true },
  });
  if (!user) return jsonError("משתמש לא נמצא", 404);
  if (user.role === "ADMIN") return jsonError("לא ניתן למחוק מנהל פלטפורמה", 403);

  await prisma.user.delete({ where: { id } });
  return jsonOk({ deleted: true });
}
