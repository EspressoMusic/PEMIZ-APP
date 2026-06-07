import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasPlatformAdminAccess } from "@/lib/admin-access";
import { jsonError, jsonOk, jsonServerError } from "@/lib/api";
import { deleteBusinessById } from "@/lib/delete-business";

const patchSchema = z.object({
  isActive: z.boolean(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasPlatformAdminAccess())) return jsonError("אין הרשאה", 403);

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const existing = await prisma.business.findUnique({ where: { id } });
  if (!existing) return jsonError("חנות לא נמצאה", 404);

  const business = await prisma.business.update({
    where: { id },
    data: {
      isActive: parsed.data.isActive,
      ...(parsed.data.isActive && !existing.approvedAt
        ? { approvedAt: new Date() }
        : {}),
    },
  });

  return jsonOk({ business });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await hasPlatformAdminAccess())) return jsonError("אין הרשאה", 403);

  const { id } = await params;
  const existing = await prisma.business.findUnique({ where: { id } });
  if (!existing) return jsonError("חנות לא נמצאה", 404);

  try {
    await deleteBusinessById(id);
    return jsonOk({ deleted: true });
  } catch (error) {
    return jsonServerError(error, "admin:businesses:delete");
  }
}
