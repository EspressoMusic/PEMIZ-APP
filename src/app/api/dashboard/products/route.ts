import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireCatalogOwner } from "@/lib/dashboard-catalog-auth";
import { regenerateAppointmentCalendar } from "@/lib/appointment-calendar-regenerate";
import { isValidProductImageUrlForSave } from "@/lib/product-image";
import { publicCatalogImageUrl } from "@/lib/public-image-url";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { productCreateSchema, zodFirstError } from "@/lib/validation/schemas";

export async function GET() {
  const ctx = await requireCatalogOwner();
  if (!ctx.ok) return ctx.response;
  const products = await prisma.product.findMany({
    where: { businessId: ctx.user.business.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      salePrice: true,
      stock: true,
      serviceDurationMinutes: true,
      imageUrl: true,
      isActive: true,
      createdAt: true,
    },
  });
  return jsonOk({
    products: products.map((p) => ({
      ...p,
      imageUrl: publicCatalogImageUrl(p.imageUrl),
    })),
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

  const { imageUrl, price, salePrice, stock, serviceDurationMinutes, ...rest } =
    parsed.data;
  if (imageUrl && !isValidProductImageUrlForSave(imageUrl)) {
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

  const product = await prisma.product.create({
    data: {
      ...rest,
      price,
      salePrice: salePrice ?? null,
      stock: stock ?? null,
      serviceDurationMinutes: serviceDurationMinutes ?? null,
      imageUrl: imageUrl || null,
      businessId: ctx.user.business.id,
    },
  });

  if (ctx.user.business.type === "APPOINTMENTS") {
    await regenerateAppointmentCalendar(ctx.user.business.id);
  }

  return jsonOk({
    product: {
      ...product,
      imageUrl: publicCatalogImageUrl(product.imageUrl),
    },
  });
}
