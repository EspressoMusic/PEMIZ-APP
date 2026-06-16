import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
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
      <div className="flex min-h-0 flex-1 flex-col gap-3 pb-2 text-center">
        <div className="px-1 text-start">
          <DashboardActionsBackLink basePath={DEV_APPOINTMENTS_SELLER_BASE} />
        </div>
        <DashboardAppointmentsCalendarSettings
          previewOnly
          basePath={DEV_APPOINTMENTS_SELLER_BASE}
          initialConfig={calendarConfigFromBusiness(DEV_APPOINTMENTS_BUSINESS)}
          workingDays={{
            initialEnabled: DEV_APPOINTMENTS_BUSINESS.orderScheduleEnabled ?? false,
            initialScheduleJson: DEV_APPOINTMENTS_BUSINESS.orderSchedule ?? null,
            previewOnly: true,
          }}
        />
      </div>
    </DevAppointmentsSellerShell>
  );
}
