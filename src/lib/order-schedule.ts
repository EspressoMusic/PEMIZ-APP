export type OrderDaySlot = {
  day: number;
  open: boolean;
  startTime: string;
  endTime: string;
};

export type OrderSchedule = {
  daySlots: OrderDaySlot[];
  /** נשמר לתאימות לאחור */
  days: number[];
  blockedDays: number[];
  startTime: string;
  endTime: string;
};

const DEFAULT_HOURS = { startTime: "08:00", endTime: "20:00" };

export const ORDER_DAY_LABELS = [
  "א׳",
  "ב׳",
  "ג׳",
  "ד׳",
  "ה׳",
  "ו׳",
  "ש׳",
] as const;

export const ORDER_DAY_FULL_HE = [
  "יום ראשון",
  "יום שני",
  "יום שלישי",
  "יום רביעי",
  "יום חמישי",
  "יום שישי",
  "יום שבת",
] as const;

export const ORDER_DAY_FULL_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function getOrderDayFullNames(locale: "he" | "en"): readonly string[] {
  return locale === "he" ? ORDER_DAY_FULL_HE : ORDER_DAY_FULL_EN;
}

export function defaultDaySlots(): OrderDaySlot[] {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open: true,
    ...DEFAULT_HOURS,
  }));
}

export function defaultOrderSchedule(): OrderSchedule {
  const daySlots = defaultDaySlots();
  return scheduleFromDaySlots(daySlots);
}

function normalizeDayList(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort(
    (a, b) => a - b
  );
}

function normalizeDaySlots(value: unknown, fallback: OrderDaySlot[]): OrderDaySlot[] {
  if (!Array.isArray(value)) return fallback;
  const byDay = new Map<number, OrderDaySlot>();
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<OrderDaySlot>;
    const day = row.day;
    if (
      typeof day !== "number" ||
      !Number.isInteger(day) ||
      day < 0 ||
      day > 6
    ) {
      continue;
    }
    const start =
      typeof row.startTime === "string" && /^\d{2}:\d{2}$/.test(row.startTime)
        ? row.startTime
        : DEFAULT_HOURS.startTime;
    const end =
      typeof row.endTime === "string" && /^\d{2}:\d{2}$/.test(row.endTime)
        ? row.endTime
        : DEFAULT_HOURS.endTime;
    byDay.set(day, {
      day,
      open: row.open !== false,
      startTime: start,
      endTime: end,
    });
  }
  return [0, 1, 2, 3, 4, 5, 6].map(
    (day) =>
      byDay.get(day) ?? {
        day,
        open: false,
        ...DEFAULT_HOURS,
      }
  );
}

function legacyToDaySlots(raw: {
  days?: unknown;
  blockedDays?: unknown;
  startTime?: string;
  endTime?: string;
}): OrderDaySlot[] {
  const days = normalizeDayList(raw.days);
  const blocked = normalizeDayList(raw.blockedDays);
  const startTime =
    typeof raw.startTime === "string" && /^\d{2}:\d{2}$/.test(raw.startTime)
      ? raw.startTime
      : DEFAULT_HOURS.startTime;
  const endTime =
    typeof raw.endTime === "string" && /^\d{2}:\d{2}$/.test(raw.endTime)
      ? raw.endTime
      : DEFAULT_HOURS.endTime;
  const openDays = days.length > 0 ? days : [0, 1, 2, 3, 4, 5, 6];

  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open: openDays.includes(day) && !blocked.includes(day),
    startTime,
    endTime,
  }));
}

export function scheduleFromDaySlots(daySlots: OrderDaySlot[]): OrderSchedule {
  const sorted = [...daySlots].sort((a, b) => a.day - b.day);
  const open = sorted.filter((s) => s.open);
  const days = open.map((s) => s.day);
  const blockedDays = sorted.filter((s) => !s.open).map((s) => s.day);
  const first = open[0];
  return {
    daySlots: sorted,
    days,
    blockedDays,
    startTime: first?.startTime ?? DEFAULT_HOURS.startTime,
    endTime: first?.endTime ?? DEFAULT_HOURS.endTime,
  };
}

export function orderScheduleToJson(daySlots: OrderDaySlot[]): string {
  const s = scheduleFromDaySlots(daySlots);
  return JSON.stringify({
    daySlots: s.daySlots,
    days: s.days,
    blockedDays: s.blockedDays,
    startTime: s.startTime,
    endTime: s.endTime,
  });
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
    const raw = JSON.parse(json) as {
      daySlots?: unknown;
      days?: unknown;
      blockedDays?: unknown;
      startTime?: string;
      endTime?: string;
    };
    const daySlots = raw.daySlots
      ? normalizeDaySlots(raw.daySlots, defaultDaySlots())
      : legacyToDaySlots(raw);
    return { enabled: true, ...scheduleFromDaySlots(daySlots) };
  } catch {
    return { enabled: true, ...defaultOrderSchedule() };
  }
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function isMinutesWithinRange(minutes: number, start: number, end: number): boolean {
  if (start <= end) return minutes >= start && minutes <= end;
  return minutes >= start || minutes <= end;
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
  const slot = s.daySlots.find((d) => d.day === day);
  if (!slot?.open) return false;

  const start = timeToMinutes(slot.startTime);
  const end = timeToMinutes(slot.endTime);
  return isMinutesWithinRange(minutes, start, end);
}

export function formatOrderScheduleSummary(
  enabled: boolean,
  json: string | null | undefined
): string {
  if (!enabled) return "הזמנות פתוחות בכל יום ושעה";
  const s = parseOrderSchedule(json, true);
  const open = s.daySlots.filter((d) => d.open);
  if (open.length === 0) return "אין ימים פתוחים להזמנות";
  if (open.length === 7) {
    const sameHours = open.every(
      (d) => d.startTime === open[0].startTime && d.endTime === open[0].endTime
    );
    if (sameHours) {
      return `כל ימות השבוע · ${open[0].startTime}–${open[0].endTime}`;
    }
  }
  const parts = open.map(
    (d) => `${ORDER_DAY_LABELS[d.day]} ${d.startTime}–${d.endTime}`
  );
  const closed = s.daySlots.filter((d) => !d.open);
  const closedLabel =
    closed.length > 0
      ? ` · סגור: ${closed.map((d) => ORDER_DAY_LABELS[d.day]).join(", ")}`
      : "";
  return `${parts.join(" · ")}${closedLabel}`;
}

export const ORDER_SCHEDULE_CLOSED_MESSAGE =
  "כרגע אי אפשר להזמין. החנות מקבלת הזמנות רק בימים ובשעות שהוגדרו.";

export function weekdayFromDateKey(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

/** האם המוכר עובד ביום לוח שנה (לפי יום בשבוע בהגדרות) */
export function isSellerWorkingDay(
  dateKey: string,
  enabled: boolean,
  json: string | null | undefined
): boolean {
  if (!enabled) return true;
  const schedule = parseOrderSchedule(json, true);
  const weekday = weekdayFromDateKey(dateKey);
  const slot = schedule.daySlots.find((s) => s.day === weekday);
  return slot?.open ?? false;
}
