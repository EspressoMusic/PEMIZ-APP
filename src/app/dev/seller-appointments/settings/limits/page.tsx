import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardAppointmentBookingByDaySettings } from "@/components/dashboard/dashboard-appointment-booking-by-day-settings";
import { DashboardAppointmentCancelSettings } from "@/components/dashboard/dashboard-appointment-cancel-settings";
import { DashboardOrderScheduleSettings } from "@/components/dashboard/dashboard-order-schedule-settings";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import { DEV_APPOINTMENTS_SELLER_BASE } from "@/lib/dev-preview-data";

export default function DevSellerAppointmentsLimitsPage() {
  return (
    <DevAppointmentsSellerShell>
      <div className="flex min-h-0 flex-1 flex-col gap-3 pb-2 text-center">
        <div className="px-1 text-start">
          <DashboardSettingsBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        </div>
        <DashboardAppointmentCancelSettings initialStoreTerms={null} previewOnly />
        <DashboardOrderScheduleSettings
          mode="appointments"
          initialEnabled={false}
          initialScheduleJson={null}
          previewOnly
        />
        <DashboardAppointmentBookingByDaySettings
          initialBookingByDay={false}
          previewOnly
        />
      </div>
    </DevAppointmentsSellerShell>
  );
}
