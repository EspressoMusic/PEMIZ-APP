import { DashboardCustomersHub } from "@/components/dashboard/dashboard-customers-hub";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import { DEV_APPOINTMENTS_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsCustomersPage() {
  return (
    <DevAppointmentsSellerShell>
      <DashboardCustomersHub basePath={DEV_APPOINTMENTS_SELLER_BASE} />
    </DevAppointmentsSellerShell>
  );
}
