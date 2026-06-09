import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardCustomersHub } from "@/components/dashboard/dashboard-customers-hub";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import { DEV_RENTAL_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsCustomersPage() {
  return (
    <DevRentalSellerShell>
      <div className="space-y-4">
        <DashboardActionsBackLink basePath={DEV_RENTAL_SELLER_BASE} />
        <DashboardCustomersHub basePath={DEV_RENTAL_SELLER_BASE} />
      </div>
    </DevRentalSellerShell>
  );
}
