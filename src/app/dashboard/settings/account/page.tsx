import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { storePanelsFromBusiness } from "@/lib/store-panels-visible";
import { DashboardSettingsView } from "@/components/dashboard-settings";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";

export default async function SettingsAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const b = user.business;

  return (
    <div className="space-y-4">
      {(b?.type === "STORE" || b?.type === "APPOINTMENTS") && (
        <DashboardSettingsBackLink />
      )}
      <DashboardSettingsView
        businessName={b?.name}
        isActive={b?.isActive ?? false}
        businessType={b?.type}
        initialStorePanels={storePanelsFromBusiness(b)}
        showQuickActionRows
      />
    </div>
  );
}
