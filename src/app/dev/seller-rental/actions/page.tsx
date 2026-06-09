import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import {
  DEV_RENTAL_BUSINESS,
  DEV_RENTAL_SELLER_BASE,
  getDevPreviewRentalSeller,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsActionsPage() {
  return (
    <DevRentalSellerShell>
      <DashboardActionsHub
        businessType="RENTAL"
        basePath={DEV_RENTAL_SELLER_BASE}
        previewOnly
        previewAppointments={getDevPreviewRentalSeller()}
        previewBookingByDay={DEV_RENTAL_BUSINESS.appointmentBookingByDay}
      />
    </DevRentalSellerShell>
  );
}
