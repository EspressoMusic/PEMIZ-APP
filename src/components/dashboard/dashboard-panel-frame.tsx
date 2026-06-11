import type { ReactNode } from "react";

/** רוחב מובייל כמו דף הבית */
export const DASHBOARD_MOBILE_STACK = "mx-auto w-full max-w-[360px]";

/** מעטפת עמוד מוכר — גובה מלא מעל סרגל תחתון */
export const DASHBOARD_LAYOUT_FRAME =
  "app-safe-x mx-auto flex h-full min-h-0 w-full max-w-[1040px] flex-col overflow-hidden py-2 sm:py-3 lg:px-[14px]";

export const DASHBOARD_LAYOUT_BODY =
  "flex min-h-0 flex-1 flex-col overflow-hidden";

/** גובה אזור התוכן מעל סרגל הניווט */
export const DASHBOARD_VIEWPORT_HEIGHT =
  "h-[calc(100dvh-76px-env(safe-area-inset-bottom)-1.5rem)] max-h-[calc(100dvh-76px-env(safe-area-inset-bottom)-1.5rem)]";

/** עמוד מוכר — בלי גלילת body */
export const DASHBOARD_PAGE_ROOT =
  "flex h-full min-h-0 flex-col overflow-hidden";

/** גלילה רק בתוך אזור תוכן (שאלות, הזמנות וכו') */
export const DASHBOARD_SCROLL_MAIN =
  "no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain";

/** מסגרת לבנה כמו דף פעולות / בית בפאנל המוכר */
export function DashboardPanelFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`dashboard-card bakery-float-panel rounded-[32px] p-4 text-center ${className}`}
    >
      {children}
    </div>
  );
}

/** כותרת עמוד / מדור בפאנל המוכר — תמיד במרכז */
export function DashboardHeading({
  children,
  level = 1,
  className = "",
}: {
  children: ReactNode;
  level?: 1 | 2;
  className?: string;
}) {
  const Tag = level === 2 ? "h2" : "h1";
  const size =
    level === 2
      ? "text-[18px] sm:text-[19px]"
      : "text-[22px] sm:text-[23px]";
  return (
    <Tag
      className={`w-full text-center font-extrabold text-bakery-ink ${size} ${className}`}
    >
      {children}
    </Tag>
  );
}

export function DashboardSellerPageStack({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${DASHBOARD_PAGE_ROOT} min-h-0 flex-1 flex-col gap-3 pb-2 text-center ${className}`}
    >
      {children}
    </div>
  );
}

/** עמוד hub (לקוחות / חנות) — פאנל מלא בגובה כמו מודל מעמוד פעולות */
export function DashboardFullscreenHubShell({
  backLink,
  children,
}: {
  backLink: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={`${DASHBOARD_PAGE_ROOT} -mt-2 flex min-h-0 flex-1 flex-col sm:mt-0`}
    >
      <div className="dashboard-card bakery-action-sheet-panel bakery-action-sheet-panel--warm bakery-action-sheet-panel--fullscreen flex min-h-0 flex-1 flex-col overflow-hidden sm:rounded-[32px]">
        <div className="shrink-0 px-3 pb-1 pt-3 text-start">{backLink}</div>
        <div className="dashboard-action-sheet-body flex min-h-0 flex-1 flex-col overflow-y-auto p-3 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
}
