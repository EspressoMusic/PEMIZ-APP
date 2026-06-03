import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";

const patchSchema = z.object({
  isActive: z.boolean().optional(),
});

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

  const deal = await prisma.storeDeal.update({
    where: { id },
    data: parsed.data,
    include: {
      items: { include: { product: true }, orderBy: { sortOrder: "asc" } },
      productA: true,
      productB: true,
    },
  });
  return jsonOk({ deal });
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
