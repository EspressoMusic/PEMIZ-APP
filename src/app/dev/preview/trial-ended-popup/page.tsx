import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  DASHBOARD_LAYOUT_BODY,
  DASHBOARD_LAYOUT_FRAME,
} from "@/components/dashboard/dashboard-panel-frame";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { trialEndedPopupMessage } from "@/lib/trial-warnings";

export default function DevTrialEndedPopupPreviewPage() {
  return (
    <div className="dashboard-surface bakery-frame-bg h-dvh overflow-hidden">
      <div className={DASHBOARD_LAYOUT_FRAME}>
        <div className={DASHBOARD_LAYOUT_BODY}>
          <DashboardShell
            businessId="dev-preview-trial-ended"
            businessType="STORE"
            basePath="/dev/preview/trial-ended-popup"
            storeLocale="he"
            storeTheme={DEV_STORE_BUSINESS.storeTheme}
            platformOwnerMessage={trialEndedPopupMessage()}
            platformOwnerMessageAt={new Date().toISOString()}
            platformOwnerMessageReadAt={null}
          >
            <div className="px-4 py-6 text-center">
              <p className="text-[13px] font-bold text-bakery-muted">
                תצוגה מקדימה — כך תיראה בדשבורד ההתראה שנשלחת כשהניסיון מסתיים
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
