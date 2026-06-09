import { AppointmentsManager } from "@/components/dashboard-client";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import {
  DEV_RENTAL_BUSINESS,
  DEV_RENTAL_SELLER_BASE,
  getDevPreviewRentalSeller,
} from "@/lib/dev-preview-data";

const DEV_APPOINTMENTS_PREVIEW = getDevPreviewRentalSeller();

export default function DevSellerAppointmentsHistoryPage() {
  return (
    <DevRentalSellerShell>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <DashboardSettingsBackLink basePath={DEV_RENTAL_SELLER_BASE} />
        <div className="min-h-0 flex-1 overflow-hidden">
          <AppointmentsManager
            previewOnly
            historyOnly
            initialAppointments={DEV_APPOINTMENTS_PREVIEW}
            initialBookingByDay={DEV_RENTAL_BUSINESS.appointmentBookingByDay}
          />
        </div>
      </div>
    </DevRentalSellerShell>
  );
}
