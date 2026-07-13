import { DashboardSettingsView } from "@/components/dashboard-settings";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_APPOINTMENTS_SELLER_BASE,
  getDevPreviewCustomerOrdersFromAppointments,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsAccountPage() {
  return (
    <DevAppointmentsSellerShell>
      <div className="space-y-4">
        <DashboardSettingsBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        <DashboardSettingsView
          businessName={DEV_APPOINTMENTS_BUSINESS.name}
          isActive
          previewOnly
          businessType="APPOINTMENTS"
          basePath={DEV_APPOINTMENTS_SELLER_BASE}
          showQuickActionRows
          previewCustomerOrders={getDevPreviewCustomerOrdersFromAppointments()}
        />
      </div>
    </DevAppointmentsSellerShell>
  );
}
