import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireCatalogOwner } from "@/lib/dashboard-catalog-auth";
import { regenerateAppointmentCalendar } from "@/lib/appointment-calendar-regenerate";
import {
  productImagesForDb,
  serializeProductImages,
} from "@/lib/product-api-images";
import { isValidProductImageUrlForSave } from "@/lib/product-image";
import {
  isValidProductImageUrlsForSave,
  resolveProductImagesInput,
} from "@/lib/product-image-urls";
import { findOwnedProduct } from "@/lib/security/ownership";
import { productPatchSchema, zodFirstError } from "@/lib/validation/schemas";

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  salePrice: true,
  stock: true,
  serviceDurationMinutes: true,
  imageUrl: true,
  imageUrls: true,
  isActive: true,
  createdAt: true,
} as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireCatalogOwner();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = productPatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const { imageUrl, imageUrls, ...rest } = parsed.data;

  if (
    imageUrl !== undefined &&
    imageUrl !== null &&
    !isValidProductImageUrlForSave(imageUrl)
  ) {
    return jsonError("תמונה לא תקינה");
  }

  if (imageUrls !== undefined) {
    const resolved = resolveProductImagesInput({ imageUrls, imageUrl: null });
    if (!isValidProductImageUrlsForSave(resolved)) {
      return jsonError("תמונה לא תקינה");
    }
  } else if (imageUrl !== undefined) {
    const resolved = resolveProductImagesInput({ imageUrl, imageUrls: null });
    if (!isValidProductImageUrlsForSave(resolved)) {
      return jsonError("תמונה לא תקינה");
    }
  }

  const existing = await findOwnedProduct(ctx.user.business.id, id);
  if (!existing) return jsonError("מוצר לא נמצא", 404);

  const nextPrice = rest.price ?? existing.price;
  const nextSale =
    rest.salePrice !== undefined ? rest.salePrice : existing.salePrice;
  if (nextSale != null && nextSale >= nextPrice) {
    return jsonError("מחיר מבצע חייב להיות נמוך מהמחיר הרגיל");
  }

  const data: Record<string, unknown> = { ...rest };

  if (imageUrls !== undefined) {
    Object.assign(data, productImagesForDb(resolveProductImagesInput({ imageUrls, imageUrl: null })));
  } else if (imageUrl !== undefined) {
    Object.assign(
      data,
      productImagesForDb(resolveProductImagesInput({ imageUrl, imageUrls: null }))
    );
  }

  const product = await prisma.product.update({
    where: { id, businessId: ctx.user.business.id },
    data,
    select: productSelect,
  });

  if (ctx.user.business.type === "APPOINTMENTS") {
    await regenerateAppointmentCalendar(ctx.user.business.id);
  }

  return jsonOk({
    product: serializeProductImages(product),
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireCatalogOwner();
  if (!ctx.ok) return ctx.response;
  const { id } = await params;

  const existing = await findOwnedProduct(ctx.user.business.id, id);
  if (!existing) return jsonError("מוצר לא נמצא", 404);

  const orderItemCount = await prisma.orderItem.count({
    where: { productId: id },
  });
  if (orderItemCount > 0) {
    return jsonError(
      "לא ניתן למחוק מוצר שמופיע בהזמנות. השתמש ב«הסתר» כדי שלא יוצג ללקוחות.",
      409
    );
  }

  const businessId = ctx.user.business.id;

  try {
    await prisma.$transaction([
      prisma.storeDeal.updateMany({
        where: { businessId, productAId: id },
        data: { productAId: null },
      }),
      prisma.storeDeal.updateMany({
        where: { businessId, productBId: id },
        data: { productBId: null },
      }),
      prisma.storeDealItem.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id, businessId } }),
    ]);
  } catch {
    return jsonError("לא ניתן למחוק את המוצר כרגע. נסו «הסתר» במקום.", 409);
  }

  if (ctx.user.business.type === "APPOINTMENTS") {
    await regenerateAppointmentCalendar(businessId);
  }

  return jsonOk({ ok: true });
}
