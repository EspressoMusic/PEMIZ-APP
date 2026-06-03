import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DealsManager } from "@/components/dashboard/deals-manager";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";

export default async function SettingsDealsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") redirect("/dashboard/settings");

  return (
    <div className="space-y-4">
      <DashboardSettingsBackLink />
      <DealsManager />
    </div>
  );
}
