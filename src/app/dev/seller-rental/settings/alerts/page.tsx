import { sellerAlertsFromBusiness } from "@/lib/seller-alerts";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardSellerAlertsSettings } from "@/components/dashboard/dashboard-seller-alerts-settings";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import { DEV_RENTAL_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsAlertsPage() {
  return (
    <DevRentalSellerShell>
      <div className="space-y-4">
        <DashboardSettingsBackLink basePath={DEV_RENTAL_SELLER_BASE} />
        <DashboardSellerAlertsSettings
          initial={sellerAlertsFromBusiness()}
          previewOnly
          businessType="RENTAL"
        />
      </div>
    </DevRentalSellerShell>
  );
}
