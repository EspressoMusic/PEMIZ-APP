import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardCustomersHub } from "@/components/dashboard/dashboard-customers-hub";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import { DEV_APPOINTMENTS_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsCustomersPage() {
  return (
    <DevAppointmentsSellerShell>
      <div className="space-y-4">
        <DashboardActionsBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        <DashboardCustomersHub basePath={DEV_APPOINTMENTS_SELLER_BASE} />
      </div>
    </DevAppointmentsSellerShell>
  );
}
