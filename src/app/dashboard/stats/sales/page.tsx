import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardSalesStats } from "@/components/dashboard/dashboard-sales-stats";

export default async function DashboardSalesStatsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  return (
    <DashboardSalesStats backHref="/dashboard/actions" />
  );
}
