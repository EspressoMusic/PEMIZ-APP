import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";
import { isValidProductImageUrl } from "@/lib/product-image";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { productCreateSchema, zodFirstError } from "@/lib/validation/schemas";

export async function GET() {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;
  const products = await prisma.product.findMany({
    where: { businessId: ctx.user.business.id },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk({ products });
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
  if (imageUrl && !isValidProductImageUrl(imageUrl)) {
    return jsonError("תמונה לא תקינה");
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
  return jsonOk({ product });
}
