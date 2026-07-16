import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { storePanelsFromBusiness } from "@/lib/store-panels-visible";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardMiscExtras } from "@/components/dashboard/dashboard-misc-extras";

export default async function SettingsMiscPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") {
    redirect("/dashboard/settings");
  }

  const panels = storePanelsFromBusiness(user.business);

  return (
    <div className="space-y-4">
      <DashboardSettingsBackLink />
      <DashboardMiscExtras
        initialOrderConfirmationRequired={user.business.orderConfirmationRequired ?? true}
        alertsVisible={panels.sellerAlerts}
        installAppVisible={panels.sellerInstallApp}
      />
    </div>
  );
}
