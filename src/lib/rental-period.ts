import { appointmentLocalDateKey } from "@/lib/appointment-calendar-shared";

export type RentalPeriodLabels = {
  rentalNight: string;
  rentalNights: string;
  rentalDay: string;
  rentalDays: string;
};

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dateKeyFromIso(iso: string): string {
  return appointmentLocalDateKey(iso);
}

export function isoAtLocalTime(dateKey: string, hours: number, minutes = 0): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, hours, minutes, 0, 0).toISOString();
}

export function countRentalNights(startAt: string, endAt: string): number {
  const startKey = dateKeyFromIso(startAt);
  const endKey = dateKeyFromIso(endAt);
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, diff);
}

export function formatShortDate(iso: string, locale: "he" | "en"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export function formatRentalPeriodLine(
  startAt: string,
  endAt: string,
  locale: "he" | "en",
  labels: RentalPeriodLabels
): string {
  const startKey = dateKeyFromIso(startAt);
  const endKey = dateKeyFromIso(endAt);
  const startLabel = formatShortDate(startAt, locale);
  const endLabel = formatShortDate(endAt, locale);

  if (startKey === endKey) {
    const unit = locale === "he" ? labels.rentalDay : labels.rentalDay;
    return `${startLabel} · 1 ${unit}`;
  }

  const nights = countRentalNights(startAt, endAt);
  const unit =
    nights === 1
      ? labels.rentalNight
      : labels.rentalNights;
  return `${startLabel} – ${endLabel} · ${nights} ${unit}`;
}

export function formatRentalPeriodCompact(
  startAt: string,
  endAt: string,
  locale: "he" | "en",
  labels: RentalPeriodLabels
): string {
  const nights = countRentalNights(startAt, endAt);
  const startKey = dateKeyFromIso(startAt);
  const endKey = dateKeyFromIso(endAt);
  if (startKey === endKey) {
    return `1 ${labels.rentalDay}`;
  }
  const unit = nights === 1 ? labels.rentalNight : labels.rentalNights;
  return `${nights} ${unit}`;
}

export function buildRentalNotes(
  serviceName: string,
  checkInDateKey: string,
  checkOutDateKey: string,
  locale: "he" | "en",
  userNotes?: string
): string {
  const startAt = isoAtLocalTime(checkInDateKey, 15, 0);
  const endAt = isoAtLocalTime(checkOutDateKey, 11, 0);
  const prefix = locale === "he" ? "שירות:" : "Service:";
  const rentalPrefix = locale === "he" ? "השכרה:" : "Rental:";
  const labels =
    locale === "he"
      ? {
          rentalNight: "לילה",
          rentalNights: "לילות",
          rentalDay: "יום",
          rentalDays: "ימים",
        }
      : {
          rentalNight: "night",
          rentalNights: "nights",
          rentalDay: "day",
          rentalDays: "days",
        };
  const parts = [
    `${prefix} ${serviceName.trim()}`,
    `${rentalPrefix} ${formatRentalPeriodLine(startAt, endAt, locale, labels)}`,
  ];
  const extra = userNotes?.trim();
  if (extra) parts.push(extra);
  return parts.join("\n");
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
