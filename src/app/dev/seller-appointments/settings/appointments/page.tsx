import { AppointmentsManager } from "@/components/dashboard-client";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_APPOINTMENTS_SELLER_BASE,
  getDevPreviewAppointmentsSeller,
} from "@/lib/dev-preview-data";

const DEV_APPOINTMENTS_PREVIEW = getDevPreviewAppointmentsSeller();

export default function DevSellerAppointmentsBookingsPage() {
  return (
    <DevAppointmentsSellerShell>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <DashboardSettingsBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        <div className="min-h-0 flex-1 overflow-hidden">
          <AppointmentsManager
            previewOnly
            initialAppointments={DEV_APPOINTMENTS_PREVIEW}
            initialBookingByDay={DEV_APPOINTMENTS_BUSINESS.appointmentBookingByDay}
          />
        </div>
      </div>
    </DevAppointmentsSellerShell>
  );
}
