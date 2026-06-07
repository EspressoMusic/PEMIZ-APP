import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardAppointmentsCalendarSettings } from "@/components/dashboard/dashboard-appointments-calendar-settings";
import { DevAppointmentsSellerShell } from "@/components/dashboard/dev-appointments-seller-shell";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_APPOINTMENTS_SELLER_BASE,
} from "@/lib/dev-preview-data";
import { calendarConfigFromBusiness } from "@/lib/appointment-calendar-config";

export default function DevSellerAppointmentsCalendarPage() {
  return (
    <DevAppointmentsSellerShell>
      <div className="flex flex-col gap-3 pb-2">
        <DashboardSettingsBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        <DashboardAppointmentsCalendarSettings
          previewOnly
          initialConfig={calendarConfigFromBusiness(DEV_APPOINTMENTS_BUSINESS)}
        />
      </div>
    </DevAppointmentsSellerShell>
  );
}
