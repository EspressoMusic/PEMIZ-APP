import { DashboardAppointmentsSettingsHub } from "@/components/dashboard/dashboard-appointments-settings-hub";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import {
  DEV_RENTAL_BUSINESS,
  DEV_RENTAL_SELLER_BASE,
  getDevPreviewRentalSeller,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsSettingsPage() {
  return (
    <DevRentalSellerShell>
      <DashboardAppointmentsSettingsHub
        basePath={DEV_RENTAL_SELLER_BASE}
        previewOnly
        previewAppointments={getDevPreviewRentalSeller()}
        previewBookingByDay={DEV_RENTAL_BUSINESS.appointmentBookingByDay}
      />
    </DevRentalSellerShell>
  );
}
