import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardAppointmentCancelSettings } from "@/components/dashboard/dashboard-appointment-cancel-settings";
import { DashboardAppointmentsCalendarSettings } from "@/components/dashboard/dashboard-appointments-calendar-settings";
import { DashboardOrderScheduleSettings } from "@/components/dashboard/dashboard-order-schedule-settings";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_APPOINTMENTS_SELLER_BASE,
} from "@/lib/dev-preview-data";
import { calendarConfigFromBusiness } from "@/lib/appointment-calendar-config";

export default function DevSellerAppointmentsCalendarPage() {
  return (
    <DevAppointmentsSellerShell>
      <div className="flex min-h-0 flex-1 flex-col gap-3 pb-2 text-center">
        <div className="px-1 text-start">
          <DashboardSettingsBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        </div>
        <DashboardAppointmentsCalendarSettings
          previewOnly
          initialConfig={calendarConfigFromBusiness(DEV_APPOINTMENTS_BUSINESS)}
        />
        <DashboardAppointmentCancelSettings initialStoreTerms={null} previewOnly />
        <DashboardOrderScheduleSettings
          mode="appointments"
          initialEnabled={false}
          initialScheduleJson={null}
          previewOnly
        />
      </div>
    </DevAppointmentsSellerShell>
  );
}
