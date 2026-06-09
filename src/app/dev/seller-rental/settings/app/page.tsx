import { DashboardInstallAppPage } from "@/components/dashboard/dashboard-install-app-page";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import { DEV_RENTAL_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsInstallAppPage() {
  return (
    <DevRentalSellerShell>
      <DashboardInstallAppPage basePath={DEV_RENTAL_SELLER_BASE} />
    </DevRentalSellerShell>
  );
}
