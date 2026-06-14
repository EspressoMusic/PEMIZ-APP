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

/** גלילה עם סרגל השלמת הזמנה מעל הניווט */
export const CUSTOMER_SCROLL_MAIN_WITH_CHECKOUT =
  "relative z-10 no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-[calc(10.5rem+env(safe-area-inset-bottom))] pt-3";

/** יומן תורים — ממלא את גובה המסך (ניווט בתוך עמודת הטלפון) */
export const CUSTOMER_SCROLL_MAIN_APPOINTMENTS_HOME =
  "relative z-10 no-scrollbar flex h-full min-h-0 flex-1 flex-col overflow-hidden px-0 pb-0 pt-0";

/** עמודת טלפון ממורכזת — רוחב קבוע 360px בדסקטופ */
export const CUSTOMER_PHONE_COLUMN =
  "flex h-full w-[min(100%,360px)] shrink-0 flex-col overflow-hidden shadow-[0_0_0_1px_rgba(58,47,38,0.1),0_10px_40px_rgba(58,47,38,0.14)]";

/** רקע מסביב לעמודת הטלפון בדסקטופ */
export const CUSTOMER_PHONE_DESKTOP_BACKDROP = "bg-[#F4F0E8]";
