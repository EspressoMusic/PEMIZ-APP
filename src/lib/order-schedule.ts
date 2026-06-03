export type OrderSchedule = {
  days: number[];
  /** ימים שסגורים להזמנות (לחיצה כפולה בממשק) */
  blockedDays: number[];
  startTime: string;
  endTime: string;
};

const DEFAULT_SCHEDULE: OrderSchedule = {
  days: [0, 1, 2, 3, 4, 5, 6],
  blockedDays: [],
  startTime: "08:00",
  endTime: "20:00",
};

export const ORDER_DAY_LABELS = [
  "א׳",
  "ב׳",
  "ג׳",
  "ד׳",
  "ה׳",
  "ו׳",
  "ש׳",
] as const;

export function defaultOrderSchedule(): OrderSchedule {
  return {
    ...DEFAULT_SCHEDULE,
    days: [...DEFAULT_SCHEDULE.days],
    blockedDays: [],
  };
}

function normalizeDayList(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort(
    (a, b) => a - b
  );
}

/** מנרמל ערך מ־input type=time ל־HH:MM */
export function normalizeTimeInput(value: string): string | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseOrderSchedule(
  json: string | null | undefined,
  enabled: boolean
): OrderSchedule & { enabled: boolean } {
  if (!enabled) {
    return { enabled: false, ...defaultOrderSchedule() };
  }
  if (!json) {
    return { enabled: true, ...defaultOrderSchedule() };
  }
  try {
    const raw = JSON.parse(json) as Partial<OrderSchedule>;
    const days = normalizeDayList(raw.days);
    const blockedDays = normalizeDayList(raw.blockedDays);
    const startTime =
      typeof raw.startTime === "string" && /^\d{2}:\d{2}$/.test(raw.startTime)
        ? raw.startTime
        : DEFAULT_SCHEDULE.startTime;
    const endTime =
      typeof raw.endTime === "string" && /^\d{2}:\d{2}$/.test(raw.endTime)
        ? raw.endTime
        : DEFAULT_SCHEDULE.endTime;
    return {
      enabled: true,
      days: days.length > 0 ? days : defaultOrderSchedule().days,
      blockedDays,
      startTime,
      endTime,
    };
  } catch {
    return { enabled: true, ...defaultOrderSchedule() };
  }
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getJerusalemNow(date: Date): { day: number; minutes: number } {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jerusalem",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");

  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return { day: map[weekday] ?? 0, minutes: hour * 60 + minute };
}

export function isWithinOrderSchedule(
  enabled: boolean,
  json: string | null | undefined,
  now = new Date()
): boolean {
  if (!enabled) return true;
  const s = parseOrderSchedule(json, true);
  const { day, minutes } = getJerusalemNow(now);
  if (s.blockedDays.includes(day)) return false;
  if (!s.days.includes(day)) return false;

  const start = timeToMinutes(s.startTime);
  const end = timeToMinutes(s.endTime);
  if (start <= end) return minutes >= start && minutes <= end;
  return minutes >= start || minutes <= end;
}

export function formatOrderScheduleSummary(
  enabled: boolean,
  json: string | null | undefined
): string {
  if (!enabled) return "הזמנות פתוחות בכל יום ושעה";
  const s = parseOrderSchedule(json, true);
  const openDays = s.days.filter((d) => !s.blockedDays.includes(d));
  const daysLabel =
    openDays.length === 7
      ? "כל ימות השבוע"
      : openDays.map((d) => ORDER_DAY_LABELS[d]).join(", ");
  const blockedLabel =
    s.blockedDays.length > 0
      ? ` · סגור: ${s.blockedDays.map((d) => ORDER_DAY_LABELS[d]).join(", ")}`
      : "";
  return `${daysLabel} · ${s.startTime}–${s.endTime}${blockedLabel}`;
}

export const ORDER_SCHEDULE_CLOSED_MESSAGE =
  "כרגע אי אפשר להזמין. החנות מקבלת הזמנות רק בימים ובשעות שהוגדרו.";
