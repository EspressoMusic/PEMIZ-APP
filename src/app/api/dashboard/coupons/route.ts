import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(30)
    .regex(
      new RegExp("^[a-zA-Z0-9\\u0590-\\u05FF_-]+$"),
      "קוד יכול להכיל אותיות (עברית/אנגלית), מספרים, מקף וקו תחתון בלבד"
    ),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().positive().optional(),
  maxRedemptions: z.number().int().positive().optional(),
  maxRedemptionsPerCustomer: z.number().int().min(0).max(99).optional(),
  validUntil: z.string().datetime().optional(),
});

const couponInclude = {
  _count: { select: { redemptions: true } },
};

export async function GET() {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;

  const coupons = await prisma.coupon.findMany({
    where: { businessId: ctx.user.business.id },
    include: couponInclude,
    orderBy: { createdAt: "desc" },
  });
  return jsonOk({ coupons });
}

export async function POST(req: Request) {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  if (parsed.data.discountType === "PERCENTAGE" && parsed.data.discountValue > 100) {
    return jsonError("אחוז הנחה לא יכול לעלות על 100");
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        businessId: ctx.user.business.id,
        code: parsed.data.code.toUpperCase(),
        discountType: parsed.data.discountType,
        discountValue: parsed.data.discountValue,
        minOrderAmount: parsed.data.minOrderAmount ?? null,
        maxRedemptions: parsed.data.maxRedemptions ?? null,
        maxRedemptionsPerCustomer: parsed.data.maxRedemptionsPerCustomer ?? 1,
        validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
      },
      include: couponInclude,
    });
    return jsonOk({ coupon });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return jsonError("כבר קיים קופון עם הקוד הזה");
    }
    throw e;
  }
}
