import { prisma } from "@/lib/prisma";
import { last7DayBuckets } from "@/lib/dashboard-stats";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const businessId = ctx.user.business.id;
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const orders = await prisma.order.findMany({
    where: { businessId, createdAt: { gte: since } },
    include: { items: true },
  });

  const buckets = last7DayBuckets();
  const salesByDay = buckets.map((b) => ({ label: b.label, value: 0 }));
  const ordersByDay = buckets.map((b) => ({ label: b.label, value: 0 }));

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const idx = buckets.findIndex((b) => b.key === key);
    if (idx < 0) continue;
    ordersByDay[idx].value += 1;
    const total = order.items.reduce(
      (sum, item) => sum + item.priceAtOrder * item.quantity,
      0
    );
    salesByDay[idx].value += Math.round(total);
  }

  return jsonOk({ salesByDay, ordersByDay });
}
