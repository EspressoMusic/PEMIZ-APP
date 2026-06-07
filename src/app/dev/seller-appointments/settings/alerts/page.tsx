import { sellerAlertsFromBusiness } from "@/lib/seller-alerts";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardSellerAlertsSettings } from "@/components/dashboard/dashboard-seller-alerts-settings";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import { DEV_APPOINTMENTS_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsAlertsPage() {
  return (
    <DevAppointmentsSellerShell>
      <div className="space-y-4">
        <DashboardSettingsBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        <DashboardSellerAlertsSettings
          initial={sellerAlertsFromBusiness()}
          previewOnly
          businessType="APPOINTMENTS"
        />
      </div>
    </DevAppointmentsSellerShell>
  );
}
