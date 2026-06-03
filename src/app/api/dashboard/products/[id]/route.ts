import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { isValidProductImageUrl } from "@/lib/product-image";

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  price: z.number().positive().optional(),
  salePrice: z.number().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  imageUrl: z.string().nullable().optional(),
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

  if (
    parsed.data.imageUrl !== undefined &&
    parsed.data.imageUrl !== null &&
    !isValidProductImageUrl(parsed.data.imageUrl)
  ) {
    return jsonError("תמונה לא תקינה");
  }

  const existing = await prisma.product.findFirst({
    where: { id, businessId: user.business.id },
  });
  if (!existing) return jsonError("מוצר לא נמצא", 404);

  const data = { ...parsed.data };
  const nextPrice = data.price ?? existing.price;
  const nextSale = data.salePrice !== undefined ? data.salePrice : existing.salePrice;
  if (nextSale != null && nextSale >= nextPrice) {
    return jsonError("מחיר מבצע חייב להיות נמוך מהמחיר הרגיל");
  }

  const product = await prisma.product.update({
    where: { id },
    data,
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
