import { DashboardInstallAppPage } from "@/components/dashboard/dashboard-install-app-page";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import { DEV_APPOINTMENTS_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsInstallAppPage() {
  return (
    <DevAppointmentsSellerShell>
      <DashboardInstallAppPage basePath={DEV_APPOINTMENTS_SELLER_BASE} />
    </DevAppointmentsSellerShell>
  );
}
