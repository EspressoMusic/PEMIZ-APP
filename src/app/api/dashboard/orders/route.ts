import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { notifyCustomerOrderStatus } from "@/lib/order-push";
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
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"]),
});

const hideSchema = z.object({
  orderIds: z.array(z.string()).min(1).max(100),
  hide: z.literal(true),
});

const patchSchema = z.union([statusSchema, hideSchema]);

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  if ("hide" in parsed.data) {
    // Removes orders from the seller's active Orders window without ever
    // deleting them — they stay in the calendar and order history.
    await prisma.order.updateMany({
      where: { id: { in: parsed.data.orderIds }, businessId: ctx.user.business.id },
      data: { sellerHiddenAt: new Date() },
    });
    return jsonOk({ ok: true });
  }

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, businessId: ctx.user.business.id },
  });
  if (!order) return jsonError("הזמנה לא נמצאה", 404);

  const updated = await prisma.order.update({
    where: { id: order.id, businessId: ctx.user.business.id },
    data: { status: parsed.data.status },
  });

  if (parsed.data.status === "CONFIRMED" || parsed.data.status === "REJECTED") {
    void notifyCustomerOrderStatus(order.id, parsed.data.status, ctx.user.business);
  }

  return jsonOk({ order: updated });
}
