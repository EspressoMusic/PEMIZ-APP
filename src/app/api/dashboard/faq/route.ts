import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";

const createSchema = z.object({
  question: z.string().min(1).max(300),
  answer: z.string().min(1).max(2000),
});

async function requireBusinessOwner() {
  const user = await getCurrentUser();
  if (!user?.business) return { error: jsonError("אין עסק", 404) };
  return { user };
}

export async function GET() {
  const ctx = await requireBusinessOwner();
  if ("error" in ctx) return ctx.error;

  const items = await prisma.faqItem.findMany({
    where: { businessId: ctx.user.business!.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return jsonOk({ items });
}

export async function POST(req: Request) {
  const ctx = await requireBusinessOwner();
  if ("error" in ctx) return ctx.error;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const count = await prisma.faqItem.count({
    where: { businessId: ctx.user.business!.id },
  });

  const item = await prisma.faqItem.create({
    data: {
      ...parsed.data,
      businessId: ctx.user.business!.id,
      sortOrder: count,
    },
  });
  return jsonOk({ item });
}
