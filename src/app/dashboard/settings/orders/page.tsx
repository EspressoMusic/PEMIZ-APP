import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OrdersManager } from "@/components/dashboard-client";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardSellerPageStack } from "@/components/dashboard/dashboard-panel-frame";

export default async function SettingsOrdersPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") redirect("/dashboard/settings");

  return (
    <DashboardSellerPageStack>
      <DashboardSettingsBackLink />
      <OrdersManager />
    </DashboardSellerPageStack>
  );
}
