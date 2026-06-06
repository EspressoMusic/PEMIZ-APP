import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";
import { isValidProductImageUrlForSave } from "@/lib/product-image";
import { publicCatalogImageUrl } from "@/lib/public-image-url";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { productCreateSchema, zodFirstError } from "@/lib/validation/schemas";

export async function GET() {
  const ctx = await requireStoreOwner();
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
  const limited = enforceRateLimit(req, "dashboard:products:create", 30, 60 * 60 * 1000);
  if (limited) return limited;

  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;
  const body = await req.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  const { imageUrl, price, salePrice, stock, ...rest } = parsed.data;
  if (imageUrl && !isValidProductImageUrlForSave(imageUrl)) {
    return jsonError("תמונה לא תקינה — העלה מחדש דרך שדה התמונה");
  }
  if (salePrice != null && salePrice >= price) {
    return jsonError("מחיר מבצע חייב להיות נמוך מהמחיר הרגיל");
  }

  const product = await prisma.product.create({
    data: {
      ...rest,
      price,
      salePrice: salePrice ?? null,
      stock: stock ?? null,
      imageUrl: imageUrl || null,
      businessId: ctx.user.business.id,
    },
  });
  return jsonOk({
    product: {
      ...product,
      imageUrl: publicCatalogImageUrl(product.imageUrl),
    },
  });
}
