const STORAGE_KEY = "linky-dashboard-help-text";

/** ברירת מחדל: ממשק נקי בלי טקסטי עזר */
export function readDashboardHelpText(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "1";
}

export function writeDashboardHelpText(enabled: boolean) {
  localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
}
