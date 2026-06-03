import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OrdersManager } from "@/components/dashboard-client";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-settings-back-link";

export default async function SettingsOrdersPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") redirect("/dashboard/settings");

  return (
    <div className="space-y-4">
      <DashboardSettingsBackLink />
      <OrdersManager title="הזמנות קיימות" />
    </div>
  );
}
