import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardAppointmentsCalendarSettings } from "@/components/dashboard/dashboard-appointments-calendar-settings";
import { DevRentalSellerShell } from "@/components/dashboard/dev-rental-seller-shell";
import {
  DEV_RENTAL_BUSINESS,
  DEV_RENTAL_SELLER_BASE,
} from "@/lib/dev-preview-data";
import { calendarConfigFromBusiness } from "@/lib/appointment-calendar-config";

export default function DevSellerAppointmentsCalendarPage() {
  return (
    <DevRentalSellerShell>
      <div className="flex min-h-0 flex-1 flex-col gap-3 pb-2 text-center">
        <div className="px-1 text-start">
          <DashboardActionsBackLink basePath={DEV_RENTAL_SELLER_BASE} />
        </div>
        <DashboardAppointmentsCalendarSettings
          previewOnly
          basePath={DEV_RENTAL_SELLER_BASE}
          initialConfig={calendarConfigFromBusiness(DEV_RENTAL_BUSINESS)}
          workingDays={{
            initialEnabled: DEV_RENTAL_BUSINESS.orderScheduleEnabled ?? false,
            initialScheduleJson: DEV_RENTAL_BUSINESS.orderSchedule ?? null,
            previewOnly: true,
          }}
        />
      </div>
    </DevRentalSellerShell>
  );
}
