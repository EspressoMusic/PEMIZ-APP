import {
  isSellerWorkingDay,
  normalizeTimeInput,
  parseOrderSchedule,
  weekdayFromDateKey,
} from "@/lib/order-schedule";
import { maxAppointmentsInWindow } from "@/lib/service-duration";

export type AppointmentCalendarConfig = {
  gapMinutes: number;
  durationMinutes: number;
  bookingStart: string;
  bookingEnd: string;
  bookingByDay?: boolean;
  showWeekend?: boolean;
};

export type GeneratedSlot = {
  startAt: Date;
  endAt: Date;
  maxBookings: number;
};

export const DEFAULT_APPOINTMENT_CALENDAR: AppointmentCalendarConfig = {
  gapMinutes: 15,
  durationMinutes: 60,
  bookingStart: "09:00",
  bookingEnd: "18:00",
  showWeekend: false,
};

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToDate(dateKey: string, minutes: number): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, Math.floor(minutes / 60), minutes % 60, 0, 0);
}

export function clampAppointmentCalendarConfig(
  input: Partial<AppointmentCalendarConfig>
): AppointmentCalendarConfig {
  const bookingStart =
    (input.bookingStart != null
      ? normalizeTimeInput(input.bookingStart)
      : null) ?? DEFAULT_APPOINTMENT_CALENDAR.bookingStart;
  const bookingEnd =
    (input.bookingEnd != null
      ? normalizeTimeInput(input.bookingEnd)
      : null) ?? DEFAULT_APPOINTMENT_CALENDAR.bookingEnd;

  return {
    gapMinutes: Math.min(180, Math.max(0, Math.round(input.gapMinutes ?? 15))),
    durationMinutes: Math.min(
      240,
      Math.max(15, Math.round(input.durationMinutes ?? 60))
    ),
    bookingStart,
    bookingEnd,
    bookingByDay: Boolean(input.bookingByDay),
    showWeekend: Boolean(input.showWeekend),
  };
}

function localDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function bookingWindowForDay(
  dateKey: string,
  config: AppointmentCalendarConfig,
  orderScheduleEnabled: boolean,
  orderSchedule: string | null | undefined
): { startMin: number; endMin: number } | null {
  if (
    !isSellerWorkingDay(dateKey, orderScheduleEnabled, orderSchedule)
  ) {
    return null;
  }

  let startMin = timeToMinutes(config.bookingStart);
  let endMin = timeToMinutes(config.bookingEnd);

  if (orderScheduleEnabled && orderSchedule) {
    const schedule = parseOrderSchedule(orderSchedule, true);
    const weekday = weekdayFromDateKey(dateKey);
    const daySlot = schedule.daySlots.find((s) => s.day === weekday);
    if (daySlot?.open) {
      startMin = Math.max(startMin, timeToMinutes(daySlot.startTime));
      endMin = Math.min(endMin, timeToMinutes(daySlot.endTime));
    }
  }

  if (endMin <= startMin) return null;
  return { startMin, endMin };
}

export function buildSlotsForDay(
  dateKey: string,
  config: AppointmentCalendarConfig,
  orderScheduleEnabled: boolean,
  orderSchedule: string | null | undefined,
  now = new Date()
): GeneratedSlot[] {
  const window = bookingWindowForDay(
    dateKey,
    config,
    orderScheduleEnabled,
    orderSchedule
  );
  if (!window) return [];

  if (config.bookingByDay) {
    const startAt = minutesToDate(dateKey, window.startMin);
    const endAt = minutesToDate(dateKey, window.endMin);
    if (endAt <= now) return [];
    const maxBookings = maxAppointmentsInWindow(
      window.endMin - window.startMin,
      config.durationMinutes,
      config.gapMinutes
    );
    return [{ startAt, endAt, maxBookings }];
  }

  const interval = config.durationMinutes + config.gapMinutes;
  const slots: GeneratedSlot[] = [];

  for (
    let t = window.startMin;
    t + config.durationMinutes <= window.endMin;
    t += interval
  ) {
    const startAt = minutesToDate(dateKey, t);
    if (startAt <= now) continue;
    const endAt = new Date(
      startAt.getTime() + config.durationMinutes * 60_000
    );
    slots.push({ startAt, endAt, maxBookings: 1 });
  }

  return slots;
}

export function buildSlotsForRange(
  config: AppointmentCalendarConfig,
  orderScheduleEnabled: boolean,
  orderSchedule: string | null | undefined,
  weeksAhead = 8,
  now = new Date()
): GeneratedSlot[] {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + weeksAhead * 7);

  const slots: GeneratedSlot[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const dateKey = localDateKey(cursor);
    slots.push(
      ...buildSlotsForDay(
        dateKey,
        config,
        orderScheduleEnabled,
        orderSchedule,
        now
      )
    );
    cursor.setDate(cursor.getDate() + 1);
  }

  return slots;
}
