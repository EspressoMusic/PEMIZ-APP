import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OrdersManager } from "@/components/dashboard-client";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
export default async function SettingsOrdersPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") redirect("/dashboard/settings");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div data-tour-id="tour-orders">
        <DashboardSettingsBackLink />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <OrdersManager autoOpenActive />
      </div>
    </div>
  );
}
