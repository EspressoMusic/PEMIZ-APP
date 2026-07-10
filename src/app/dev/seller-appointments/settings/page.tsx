import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_APPOINTMENTS_SELLER_BASE,
  getDevPreviewAppointmentsSeller,
} from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsSettingsPage() {
  return (
    <DevAppointmentsSellerShell>
      <DashboardActionsHub
        businessType="APPOINTMENTS"
        basePath={DEV_APPOINTMENTS_SELLER_BASE}
        initialOpenPanel="store"
        previewOnly
        previewAppointments={getDevPreviewAppointmentsSeller()}
        previewBookingByDay={DEV_APPOINTMENTS_BUSINESS.appointmentBookingByDay}
      />
    </DevAppointmentsSellerShell>
  );
}
