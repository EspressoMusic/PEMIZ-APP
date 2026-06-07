import { ProductsManager } from "@/components/dashboard/products-manager";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_APPOINTMENTS_SELLER_BASE,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsServicesPage() {
  return (
    <DevAppointmentsSellerShell>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <DashboardSettingsBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        <div className="min-h-0 flex-1 overflow-hidden">
          <ProductsManager
            mode="services"
            previewOnly
            initialProducts={DEV_APPOINTMENTS_BUSINESS.products}
          />
        </div>
      </div>
    </DevAppointmentsSellerShell>
  );
}
