import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  price: z.number().positive().optional(),
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

  const existing = await prisma.product.findFirst({
    where: { id, businessId: user.business.id },
  });
  if (!existing) return jsonError("מוצר לא נמצא", 404);

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });
  return jsonOk({ product });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("אין עסק", 404);
  const { id } = await params;

  const existing = await prisma.product.findFirst({
    where: { id, businessId: user.business.id },
  });
  if (!existing) return jsonError("מוצר לא נמצא", 404);

  await prisma.product.delete({ where: { id } });
  return jsonOk({ ok: true });
}
