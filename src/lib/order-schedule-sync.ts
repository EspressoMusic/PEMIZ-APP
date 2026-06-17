export const LINKY_ORDER_SCHEDULE_UPDATED_EVENT = "linky-order-schedule-updated";

export function isDashboardHomePath(pathname: string, basePath: string) {
  return pathname === basePath || pathname === `${basePath}/`;
}

export function devWorkingDaysStorageKey(basePath: string) {
  return `linky-dev-working-days:${basePath}`;
}

export function readDevWorkingDaysOverride(
  basePath: string,
  fallbackEnabled: boolean,
  fallbackJson: string | null
): { enabled: boolean; json: string | null } {
  if (typeof window === "undefined") {
    return { enabled: fallbackEnabled, json: fallbackJson };
  }
  const raw = window.sessionStorage.getItem(devWorkingDaysStorageKey(basePath));
  if (!raw) return { enabled: fallbackEnabled, json: fallbackJson };
  try {
    const parsed = JSON.parse(raw) as {
      enabled?: boolean;
      json?: string | null;
    };
    return {
      enabled: parsed.enabled ?? fallbackEnabled,
      json: parsed.json ?? fallbackJson,
    };
  } catch {
    return { enabled: fallbackEnabled, json: fallbackJson };
  }
}

export function writeDevWorkingDaysOverride(
  basePath: string,
  enabled: boolean,
  json: string | null
) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    devWorkingDaysStorageKey(basePath),
    JSON.stringify({ enabled, json })
  );
}

export function notifyOrderScheduleUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LINKY_ORDER_SCHEDULE_UPDATED_EVENT));
}
