import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { z } from "zod";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  const orders = await prisma.order.findMany({
    where: { businessId: ctx.user.business.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return jsonOk({ orders });
}

const statusSchema = z.object({
  orderId: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
});

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  const body = await req.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, businessId: ctx.user.business.id },
  });
  if (!order) return jsonError("הזמנה לא נמצאה", 404);

  const updated = await prisma.order.update({
    where: { id: order.id, businessId: ctx.user.business.id },
    data: { status: parsed.data.status },
  });
  return jsonOk({ order: updated });
}
