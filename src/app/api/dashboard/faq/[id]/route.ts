import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";

const patchSchema = z.object({
  question: z.string().min(1).max(300).optional(),
  answer: z.string().min(1).max(2000).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
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

  const existing = await prisma.faqItem.findFirst({
    where: { id, businessId: user.business.id },
  });
  if (!existing) return jsonError("לא נמצא", 404);

  const item = await prisma.faqItem.update({
    where: { id },
    data: parsed.data,
  });
  return jsonOk({ item });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("אין עסק", 404);

  const { id } = await params;
  const existing = await prisma.faqItem.findFirst({
    where: { id, businessId: user.business.id },
  });
  if (!existing) return jsonError("לא נמצא", 404);

  await prisma.faqItem.delete({ where: { id } });
  return jsonOk({ ok: true });
}
