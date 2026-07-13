import { DashboardSettingsView } from "@/components/dashboard-settings";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import {
  DEV_RENTAL_BUSINESS,
  DEV_RENTAL_SELLER_BASE,
  getDevPreviewCustomerOrdersFromAppointments,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsAccountPage() {
  return (
    <DevRentalSellerShell>
      <div className="space-y-4">
        <DashboardSettingsBackLink basePath={DEV_RENTAL_SELLER_BASE} />
        <DashboardSettingsView
          businessName={DEV_RENTAL_BUSINESS.name}
          isActive
          previewOnly
          businessType="RENTAL"
          basePath={DEV_RENTAL_SELLER_BASE}
          showQuickActionRows
          previewCustomerOrders={getDevPreviewCustomerOrdersFromAppointments()}
        />
      </div>
    </DevRentalSellerShell>
  );
}
