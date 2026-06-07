import { DashboardAppointmentsSettingsHub } from "@/components/dashboard/dashboard-appointments-settings-hub";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import { DEV_APPOINTMENTS_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsSettingsPage() {
  return (
    <DevAppointmentsSellerShell>
      <DashboardAppointmentsSettingsHub basePath={DEV_APPOINTMENTS_SELLER_BASE} />
    </DevAppointmentsSellerShell>
  );
}
