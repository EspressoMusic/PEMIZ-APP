import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { last7DayBuckets } from "@/lib/dashboard-stats";
import { DashboardStatsView } from "@/components/dashboard/dashboard-stats-view";

export default async function DashboardSalesStatsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const orders = await prisma.order.findMany({
    where: { businessId: user.business.id, createdAt: { gte: since } },
    include: { items: true },
  });

  const buckets = last7DayBuckets();
  const points = buckets.map((b) => ({ label: b.label, value: 0 }));

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const idx = buckets.findIndex((b) => b.key === key);
    if (idx < 0) continue;
    points[idx].value += Math.round(
      order.items.reduce((s, i) => s + i.priceAtOrder * i.quantity, 0)
    );
  }

  return (
    <DashboardStatsView
      title="סטטיסטיקת מכירות"
      unit="₪"
      points={points}
      backHref="/dashboard/actions"
    />
  );
}
