import { ProductsManager } from "@/components/dashboard/products-manager";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import {
  DEV_RENTAL_BUSINESS,
  DEV_RENTAL_SELLER_BASE,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsServicesPage() {
  return (
    <DevRentalSellerShell>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <DashboardSettingsBackLink basePath={DEV_RENTAL_SELLER_BASE} />
        <div className="min-h-0 flex-1 overflow-hidden">
          <ProductsManager
            autoOpenList
            mode="services"
            previewOnly
            initialProducts={DEV_RENTAL_BUSINESS.products}
          />
        </div>
      </div>
    </DevRentalSellerShell>
  );
}
