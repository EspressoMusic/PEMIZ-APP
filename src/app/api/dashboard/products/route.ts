import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  price: z.number().positive(),
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
  const products = await prisma.product.findMany({
    where: { businessId: ctx.user.business!.id },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk({ products });
}

export async function POST(req: Request) {
  const ctx = await requireStoreOwner();
  if ("error" in ctx) return ctx.error;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const product = await prisma.product.create({
    data: { ...parsed.data, businessId: ctx.user.business!.id },
  });
  return jsonOk({ product });
}
