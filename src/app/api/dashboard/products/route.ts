import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireCatalogOwner } from "@/lib/dashboard-catalog-auth";
import { regenerateAppointmentCalendar } from "@/lib/appointment-calendar-regenerate";
import {
  productImagesForDb,
  serializeProductImages,
} from "@/lib/product-api-images";
import {
  isValidProductImageUrlsForSave,
  resolveProductImagesInput,
} from "@/lib/product-image-urls";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { productCreateSchema, zodFirstError } from "@/lib/validation/schemas";

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

export async function GET() {
  const ctx = await requireCatalogOwner();
  if (!ctx.ok) return ctx.response;
  const products = await prisma.product.findMany({
    where: { businessId: ctx.user.business.id },
    orderBy: { createdAt: "desc" },
    select: productSelect,
  });
  return jsonOk({
    products: products.map((p) => serializeProductImages(p)),
  });
}

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "dashboard:products:create", 30, 60 * 60 * 1000);
  if (limited) return limited;

  const ctx = await requireCatalogOwner();
  if (!ctx.ok) return ctx.response;
  const body = await req.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const {
    imageUrl,
    imageUrls,
    price,
    salePrice,
    stock,
    serviceDurationMinutes,
    ...rest
  } = parsed.data;
  const resolvedImages = resolveProductImagesInput({ imageUrl, imageUrls });
  if (!isValidProductImageUrlsForSave(resolvedImages)) {
    return jsonError("תמונה לא תקינה — העלה מחדש דרך שדה התמונה");
  }
  if (salePrice != null && salePrice >= price) {
    return jsonError("מחיר מבצע חייב להיות נמוך מהמחיר הרגיל");
  }

  if (
    ctx.user.business.type === "APPOINTMENTS" &&
    (serviceDurationMinutes == null || serviceDurationMinutes < 15)
  ) {
    return jsonError("יש להזין משך שירות (לפחות 15 דקות)");
  }

  const imageFields = productImagesForDb(resolvedImages);
  const product = await prisma.product.create({
    data: {
      ...rest,
      price,
      salePrice: salePrice ?? null,
      stock: stock ?? null,
      serviceDurationMinutes: serviceDurationMinutes ?? null,
      ...imageFields,
      businessId: ctx.user.business.id,
    },
    select: productSelect,
  });

  if (ctx.user.business.type === "APPOINTMENTS") {
    await regenerateAppointmentCalendar(ctx.user.business.id);
  }

  return jsonOk({
    product: serializeProductImages(product),
  });
}
