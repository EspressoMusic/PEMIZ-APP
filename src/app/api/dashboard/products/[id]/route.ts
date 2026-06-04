import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";
import { isValidProductImageUrl } from "@/lib/product-image";
import { findOwnedProduct } from "@/lib/security/ownership";
import { productPatchSchema, zodFirstError } from "@/lib/validation/schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = productPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  if (
    parsed.data.imageUrl !== undefined &&
    parsed.data.imageUrl !== null &&
    !isValidProductImageUrl(parsed.data.imageUrl)
  ) {
    return jsonError("תמונה לא תקינה");
  }

  const existing = await findOwnedProduct(ctx.user.business.id, id);
  if (!existing) return jsonError("מוצר לא נמצא", 404);

  const data = { ...parsed.data };
  const nextPrice = data.price ?? existing.price;
  const nextSale = data.salePrice !== undefined ? data.salePrice : existing.salePrice;
  if (nextSale != null && nextSale >= nextPrice) {
    return jsonError("מחיר מבצע חייב להיות נמוך מהמחיר הרגיל");
  }

  const product = await prisma.product.update({
    where: { id, businessId: ctx.user.business.id },
    data,
  });
  return jsonOk({ product });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;

  const existing = await findOwnedProduct(ctx.user.business.id, id);
  if (!existing) return jsonError("מוצר לא נמצא", 404);

  await prisma.product.delete({
    where: { id, businessId: ctx.user.business.id },
  });
  return jsonOk({ ok: true });
}
