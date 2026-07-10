import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import { DEV_RENTAL_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerRentalCustomersPage() {
  return (
    <DevRentalSellerShell>
      <DashboardActionsHub
        businessType="RENTAL"
        basePath={DEV_RENTAL_SELLER_BASE}
        initialOpenPanel="customers"
      />
    </DevRentalSellerShell>
  );
}
