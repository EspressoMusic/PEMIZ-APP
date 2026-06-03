import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1).max(120),
  productAId: z.string(),
  productBId: z.string(),
  dealPrice: z.number().positive(),
  validUntil: z.string().datetime(),
});

async function requireStoreOwner() {
  const user = await getCurrentUser();
  if (!user?.business) return { error: jsonError("אין עסק", 404) };
  if (user.business.type !== "STORE") return { error: jsonError("עסק לא במצב חנות", 400) };
  return { user };
}

export async function GET() {
  const ctx = await requireStoreOwner();
  if ("error" in ctx) return ctx.error;

  const deals = await prisma.storeDeal.findMany({
    where: { businessId: ctx.user.business!.id },
    include: {
      productA: true,
      productB: true,
      _count: { select: { redemptions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk({ deals });
}

export async function POST(req: Request) {
  const ctx = await requireStoreOwner();
  if ("error" in ctx) return ctx.error;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  if (parsed.data.productAId === parsed.data.productBId) {
    return jsonError("בחר שני מוצרים שונים");
  }

  const products = await prisma.product.findMany({
    where: {
      businessId: ctx.user.business!.id,
      id: { in: [parsed.data.productAId, parsed.data.productBId] },
    },
  });
  if (products.length !== 2) return jsonError("מוצר לא תקין");

  const deal = await prisma.storeDeal.create({
    data: {
      businessId: ctx.user.business!.id,
      name: parsed.data.name,
      productAId: parsed.data.productAId,
      productBId: parsed.data.productBId,
      dealPrice: parsed.data.dealPrice,
      validUntil: new Date(parsed.data.validUntil),
    },
    include: { productA: true, productB: true },
  });
  return jsonOk({ deal });
}
