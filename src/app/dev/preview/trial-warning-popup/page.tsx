import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  DASHBOARD_LAYOUT_BODY,
  DASHBOARD_LAYOUT_FRAME,
} from "@/components/dashboard/dashboard-panel-frame";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { trialWarningPopupMessage } from "@/lib/trial-warnings";
import type { TrialWarningDaysLeft } from "@/lib/email";

export default async function DevTrialWarningPopupPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { days } = await searchParams;
  const daysLeft: TrialWarningDaysLeft =
    days === "7" || days === "1" ? Number(days) as TrialWarningDaysLeft : 3;
  const trialEndsAt = new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000);

  return (
    <div className="dashboard-surface bakery-frame-bg h-dvh overflow-hidden">
      <div className={DASHBOARD_LAYOUT_FRAME}>
        <div className={DASHBOARD_LAYOUT_BODY}>
          <DashboardShell
            businessId="dev-preview-trial-warning"
            businessType="STORE"
            basePath="/dev/preview/trial-warning-popup"
            storeLocale="he"
            storeTheme={DEV_STORE_BUSINESS.storeTheme}
            platformOwnerMessage={trialWarningPopupMessage(daysLeft, trialEndsAt)}
            platformOwnerMessageAt={new Date().toISOString()}
            platformOwnerMessageReadAt={null}
          >
            <div className="px-4 py-6 text-center">
              <p className="text-[13px] font-bold text-bakery-muted">
                תצוגה מקדימה — כך תיראה בדשבורד ההתראה שנשלחת אוטומטית{" "}
                {daysLeft === 1 ? "יום" : daysLeft === 3 ? "3 ימים" : "שבוע"}{" "}
                לפני סוף הניסיון
              </p>
              <p className="mt-2 text-[12px] text-bakery-muted">
                לחצו על הבאנר למעלה כדי לפתוח את ההודעה (אפשר גם ?days=7 או ?days=1 בכתובת)
              </p>
            </div>
          </DashboardShell>
        </div>
      </div>
    </div>
  );
}
