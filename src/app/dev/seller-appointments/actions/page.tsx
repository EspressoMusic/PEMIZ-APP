import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import { DEV_APPOINTMENTS_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsActionsPage() {
  return (
    <DevAppointmentsSellerShell>
      <DashboardActionsHub
        businessType="APPOINTMENTS"
        basePath={DEV_APPOINTMENTS_SELLER_BASE}
        previewOnly
      />
    </DevAppointmentsSellerShell>
  );
}
