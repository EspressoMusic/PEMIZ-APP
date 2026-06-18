import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  DASHBOARD_LAYOUT_BODY,
  DASHBOARD_LAYOUT_FRAME,
} from "@/components/dashboard/dashboard-panel-frame";
import { DEV_APPOINTMENTS_BUSINESS } from "@/lib/dev-preview-data";

export default function DevPlatformMessagePreviewPage() {
  return (
    <div className="dashboard-surface bakery-frame-bg h-dvh overflow-hidden">
      <div className={DASHBOARD_LAYOUT_FRAME}>
        <div className={DASHBOARD_LAYOUT_BODY}>
          <DashboardShell
            businessId="dev-guide-preview-platform-msg"
            businessType="APPOINTMENTS"
            basePath="/dev/preview/platform-message"
            storeLocale="he"
            orderScheduleEnabled={DEV_APPOINTMENTS_BUSINESS.orderScheduleEnabled ?? true}
            orderSchedule={DEV_APPOINTMENTS_BUSINESS.orderSchedule ?? null}
            platformOwnerMessage="שלום! זו הודעה לדוגמה מצוות Linky — כך זה ייראה למוכר/ת בדשבורד (לא במייל)."
            platformOwnerMessageAt={new Date().toISOString()}
            platformOwnerMessageReadAt={null}
          >
            <div className="px-4 py-6 text-center">
              <p className="text-[13px] font-bold text-bakery-muted">
                תצוגה מקדימה — באנר הודעה מצוות Linky בראש הדשבורד
              </p>
              <p className="mt-2 text-[12px] text-bakery-muted">
                לחצו על הבאנר למעלה כדי לפתוח את ההודעה
              </p>
            </div>
          </DashboardShell>
        </div>
      </div>
    </div>
  );
}
