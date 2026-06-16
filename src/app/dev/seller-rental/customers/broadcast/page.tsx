import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardStoreBroadcast } from "@/components/dashboard/dashboard-store-broadcast";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import { DEV_RENTAL_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsCustomersBroadcastPage() {
  return (
    <DevRentalSellerShell>
      <div className="space-y-4">
        <DashboardCustomersBackLink basePath={DEV_RENTAL_SELLER_BASE} />
        <DashboardStoreBroadcast previewOnly />
      </div>
    </DevRentalSellerShell>
  );
}
