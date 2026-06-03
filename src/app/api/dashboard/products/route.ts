import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";
import { isValidProductImageUrl } from "@/lib/product-image";

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional().nullable(),
  imageUrl: z.string().optional(),
  stock: z.number().int().min(0).optional().nullable(),
});

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
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

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
