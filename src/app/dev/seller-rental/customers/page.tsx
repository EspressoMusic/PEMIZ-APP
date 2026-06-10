import { DashboardCustomersHub } from "@/components/dashboard/dashboard-customers-hub";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import { DEV_RENTAL_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerRentalCustomersPage() {
  return (
    <DevRentalSellerShell>
      <DashboardCustomersHub basePath={DEV_RENTAL_SELLER_BASE} />
    </DevRentalSellerShell>
  );
}
