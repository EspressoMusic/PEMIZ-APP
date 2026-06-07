import { DashboardSettingsView } from "@/components/dashboard-settings";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import { DEV_APPOINTMENTS_BUSINESS, DEV_APPOINTMENTS_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsAccountPage() {
  return (
    <DevAppointmentsSellerShell>
      <div className="space-y-4">
        <DashboardSettingsBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        <DashboardSettingsView
          ownerName="בעל/ת סטודיו (תצוגה)"
          email="appointments@linky.local"
          phone="050-1234567"
          businessName={DEV_APPOINTMENTS_BUSINESS.name}
          isActive
          storeUrl="/dev/customer-appointments"
          previewSlug="demo-appointments"
          previewOnly
        />
      </div>
    </DevAppointmentsSellerShell>
  );
}
