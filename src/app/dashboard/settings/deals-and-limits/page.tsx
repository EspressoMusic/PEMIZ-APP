import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardDealsAndLimitsHub } from "@/components/dashboard/dashboard-deals-and-limits-hub";

export default async function SettingsDealsAndLimitsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") redirect("/dashboard/settings");

  return <DashboardDealsAndLimitsHub />;
}
