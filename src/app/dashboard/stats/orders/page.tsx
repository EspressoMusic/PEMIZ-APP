import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardOrdersStatsClient } from "@/components/dashboard/dashboard-orders-stats-client";

export default async function DashboardOrdersStatsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const orders = await prisma.order.findMany({
    where: { businessId: user.business.id, createdAt: { gte: since } },
    select: { createdAt: true },
  });

  return (
    <DashboardOrdersStatsClient
      orderDates={orders.map((o) => o.createdAt.toISOString())}
      backHref="/dashboard/actions"
    />
  );
}
