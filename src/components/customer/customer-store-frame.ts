/** רוחב מסך טלפון — כמו לוח המוכר */
export const CUSTOMER_MOBILE_STACK = "mx-auto w-full max-w-[360px]";

/** גובה אזור התוכן מעל סרגל הניווט */
export const CUSTOMER_VIEWPORT_HEIGHT =
  "min-h-0 flex-1 overflow-hidden";

/** עמוד לקוח — בלי גלילת body */
export const CUSTOMER_PAGE_ROOT =
  "flex h-full min-h-0 w-full flex-col overflow-hidden";

/** גלילה רק בתוך אזור התוכן */
export const CUSTOMER_SCROLL_MAIN =
  "relative z-10 no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-3";

/** יומן תורים — ממלא את גובה המסך */
export const CUSTOMER_SCROLL_MAIN_APPOINTMENTS_HOME =
  "relative z-10 no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-0 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-0";
