import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { sellerAlertsFromBusiness } from "@/lib/seller-alerts";
import { parseBusinessType } from "@/lib/types";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardSellerAlertsSettings } from "@/components/dashboard/dashboard-seller-alerts-settings";

export default async function SettingsAlertsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE" && user.business.type !== "APPOINTMENTS") {
    redirect("/dashboard/settings");
  }

  return (
    <div className="space-y-4">
      <DashboardSettingsBackLink />
      <DashboardSellerAlertsSettings
        initial={sellerAlertsFromBusiness(user.business)}
        businessType={parseBusinessType(user.business.type)}
      />
    </div>
  );
}
