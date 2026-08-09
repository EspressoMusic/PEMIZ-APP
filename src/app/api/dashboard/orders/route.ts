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
  return jsonOk({
    orders,
    orderConfirmationRequired: ctx.user.business.orderConfirmationRequired ?? true,
  });
}

const statusSchema = z.object({
  orderId: z.string(),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"]),
});

const hideSchema = z.object({
  orderIds: z.array(z.string()).min(1).max(100),
  hide: z.literal(true),
});

const hidePrepSchema = z.object({
  orderIds: z.array(z.string()).min(1).max(100),
  hidePrep: z.literal(true),
});

const markOpenedSchema = z.object({
  orderId: z.string(),
  markOpened: z.literal(true),
});

const patchSchema = z.union([
  statusSchema,
  hideSchema,
  hidePrepSchema,
  markOpenedSchema,
]);

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  if ("hidePrep" in parsed.data) {
    // Dismisses orders from the dashboard home prep-summary widget only —
    // unlike `hide` below, this must NOT affect the Orders panel's
    // active/history split, so the order stays fully active there.
    await prisma.order.updateMany({
      where: { id: { in: parsed.data.orderIds }, businessId: ctx.user.business.id },
      data: { prepHiddenAt: new Date() },
    });
    return jsonOk({ ok: true });
  }

  if ("hide" in parsed.data) {
    // Removes orders from the seller's active Orders window without ever
    // deleting them — they stay in the calendar and order history.
    await prisma.order.updateMany({
      where: { id: { in: parsed.data.orderIds }, businessId: ctx.user.business.id },
      data: { sellerHiddenAt: new Date() },
    });
    return jsonOk({ ok: true });
  }

  if ("markOpened" in parsed.data) {
    // Persists the "נפתח" badge so it survives a reload — this used to live
    // in component state only, which reset every time the app was closed.
    await prisma.order.updateMany({
      where: { id: parsed.data.orderId, businessId: ctx.user.business.id },
      data: { sellerOpenedAt: new Date() },
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
