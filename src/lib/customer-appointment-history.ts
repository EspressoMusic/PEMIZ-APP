import type { CustomerLocale } from "@/lib/customer-preferences";
import {
  getCustomerDeviceItem,
  setCustomerDeviceItem,
} from "@/lib/customer-device-storage";

export type CustomerAppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export type CustomerAppointmentEntry = {
  id: string;
  slotId: string;
  startAt: string;
  endAt: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  status: CustomerAppointmentStatus;
  bookedAt: string;
};

function storageKey(slug: string) {
  return `linky-appointment-history-${slug}`;
}

export function loadCustomerAppointmentHistory(
  slug: string
): CustomerAppointmentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = getCustomerDeviceItem(storageKey(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomerAppointmentEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomerAppointmentHistory(
  slug: string,
  entries: CustomerAppointmentEntry[]
) {
  setCustomerDeviceItem(storageKey(slug), JSON.stringify(entries));
}

export function appendCustomerAppointmentHistory(
  slug: string,
  entry: CustomerAppointmentEntry
): CustomerAppointmentEntry[] {
  const next = [entry, ...loadCustomerAppointmentHistory(slug)];
  saveCustomerAppointmentHistory(slug, next);
  return next;
}

export function updateCustomerAppointmentHistory(
  slug: string,
  appointmentId: string,
  patch: Partial<CustomerAppointmentEntry>
): CustomerAppointmentEntry[] {
  const next = loadCustomerAppointmentHistory(slug).map((entry) =>
    entry.id === appointmentId ? { ...entry, ...patch } : entry
  );
  saveCustomerAppointmentHistory(slug, next);
  return next;
}

export function buildAppointmentNotes(
  serviceName: string,
  userNotes: string | undefined,
  locale: CustomerLocale
) {
  const prefix = locale === "he" ? "שירות:" : "Service:";
  const parts = [`${prefix} ${serviceName.trim()}`];
  const extra = userNotes?.trim();
  if (extra) parts.push(extra);
  return parts.join("\n");
}

export function parseServiceFromNotes(
  notes: string | null | undefined
): string {
  if (!notes?.trim()) return "";
  const line = notes.split("\n")[0]?.trim() ?? "";
  const m = line.match(/^(?:שירות|Service):\s*(.+)$/i);
  return m?.[1]?.trim() ?? "";
}

export function parseCustomerNoteFromNotes(
  notes: string | null | undefined
): string {
  if (!notes?.trim()) return "";
  const lines = notes
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const rest = lines.filter(
    (line, index) => !(index === 0 && /^(?:שירות|Service):/i.test(line))
  );
  return rest.join("\n").trim();
}

export function formatAppointmentDateTime(
  iso: string,
  locale: CustomerLocale
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(locale === "he" ? "he-IL" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
