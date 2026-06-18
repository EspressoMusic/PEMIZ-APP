import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  DASHBOARD_LAYOUT_BODY,
  DASHBOARD_LAYOUT_FRAME,
} from "@/components/dashboard/dashboard-panel-frame";

export default function DevAppointmentSetupPreviewPage() {
  return (
    <div className="dashboard-surface bakery-frame-bg h-dvh overflow-hidden">
      <div className={DASHBOARD_LAYOUT_FRAME}>
        <div className={DASHBOARD_LAYOUT_BODY}>
          <DashboardShell
            businessId="dev-guide-preview-appt-setup"
            businessType="APPOINTMENTS"
            basePath="/dev/preview/appointment-setup"
            storeLocale="he"
            orderScheduleEnabled={false}
            orderSchedule={null}
          >
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6 text-center opacity-40">
              <p className="text-[14px] font-semibold text-bakery-muted">
                דשבורד חנות פגישות (מאחורי חלון ההגדרה)
              </p>
            </div>
          </DashboardShell>
        </div>
      </div>
    </div>
  );
}
