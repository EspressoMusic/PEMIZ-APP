export type CalendarSlot = {
  id: string;
  startAt: string;
  endAt: string;
  maxBookings: number;
  appointments: unknown[];
};

export function appointmentLocalDateKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function appointmentStartOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function appointmentAddMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

export function buildAppointmentMonthCells(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const leading = first.getDay();
  const daysInMonth = last.getDate();
  const cells: Array<{ day: number | null; dateKey: string | null }> = [];

  for (let i = 0; i < leading; i++) cells.push({ day: null, dateKey: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, dateKey });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, dateKey: null });
  return cells;
}

export function formatAppointmentMonthTitle(
  month: Date,
  locale: "he" | "en"
) {
  return month.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
    month: "long",
    year: "numeric",
  });
}

export function formatAppointmentSlotTime(iso: string, locale: "he" | "en") {
  return new Date(iso).toLocaleTimeString(locale === "he" ? "he-IL" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatAppointmentDayTitle(
  dateKey: string,
  locale: "he" | "en"
) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function calendarSlotIsOpen(slot: CalendarSlot) {
  return (
    slot.appointments.length < slot.maxBookings &&
    new Date(slot.startAt) > new Date()
  );
}

export const APPOINTMENT_WEEKDAYS_HE = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
export const APPOINTMENT_WEEKDAYS_EN = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];
