"use client";

import { useMemo } from "react";
import { Calendar } from "lucide-react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { CustomerLabels } from "./customer-labels";
import { SettingsMenuSubRow } from "./customer-ui";
import {
  appointmentLocalDateKey,
  appointmentSlotIsOpen,
  type AppointmentSlot,
} from "./customer-appointment-calendar";

function formatSlotTime(iso: string, locale: CustomerLocale) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(locale === "he" ? "he-IL" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSlotDateLabel(
  dateKey: string,
  locale: CustomerLocale,
  labels: Pick<CustomerLabels, "appointmentToday" | "appointmentTomorrow">
) {
  const todayKey = appointmentLocalDateKey(new Date().toISOString());
  if (dateKey === todayKey) return labels.appointmentToday;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = appointmentLocalDateKey(tomorrow.toISOString());
  if (dateKey === tomorrowKey) return labels.appointmentTomorrow;

  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export function CustomerAppointmentOpenSlotsPanel({
  slots,
  locale,
  labels,
  bookingByDay = false,
  onSelect,
  onOpenCalendar,
}: {
  slots: AppointmentSlot[];
  locale: CustomerLocale;
  labels: CustomerLabels;
  bookingByDay?: boolean;
  onSelect: (dateKey: string, openSlots: AppointmentSlot[]) => void;
  onOpenCalendar?: () => void;
}) {
  const openSlots = useMemo(() => {
    const list = slots
      .filter(appointmentSlotIsOpen)
      .sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      );

    if (!bookingByDay) return list.slice(0, 5);

    const seen = new Set<string>();
    const byDay: AppointmentSlot[] = [];
    for (const slot of list) {
      const key = appointmentLocalDateKey(slot.startAt);
      if (seen.has(key)) continue;
      seen.add(key);
      byDay.push(slot);
      if (byDay.length >= 5) break;
    }
    return byDay;
  }, [slots, bookingByDay]);

  return (
    <div
      className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border-[3px] border-[#5C4A3E]/22 bg-bakery-square shadow-[0_3px_10px_rgba(58,47,38,0.1)]"
      role="region"
      aria-label={labels.upcomingOpenSlots}
    >
      <h2 className="shrink-0 px-3 pb-1.5 pt-2.5 text-center text-[15px] font-extrabold text-bakery-ink">
        {labels.upcomingOpenSlots}
      </h2>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2 [-webkit-overflow-scrolling:touch]">
        {openSlots.length === 0 ? (
          <p className="px-2 py-4 text-center text-[14px] font-semibold text-bakery-muted">
            {labels.noUpcomingOpenSlots}
          </p>
        ) : (
          <ul className="space-y-2">
            {openSlots.map((slot) => {
              const dateKey = appointmentLocalDateKey(slot.startAt);
              const dayOpenSlots = slots.filter(
                (s) =>
                  appointmentLocalDateKey(s.startAt) === dateKey &&
                  appointmentSlotIsOpen(s)
              );
              const timeLine = bookingByDay ? null : formatSlotTime(slot.startAt, locale);

              return (
                <li key={slot.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(dateKey, dayOpenSlots)}
                    dir="ltr"
                    className="flex w-full items-center gap-2 rounded-[18px] border border-bakery-border/35 bg-bakery-card px-3 py-3 text-start transition hover:opacity-95 active:scale-[0.99]"
                  >
                    <p className="w-[4.25rem] shrink-0 text-[12px] font-extrabold leading-tight text-bakery-ink">
                      {formatSlotDateLabel(dateKey, locale, labels)}
                    </p>
                    {timeLine ? (
                      <div className="flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border-[2px] border-bakery-border/40 bg-[#F2EBE0] px-0.5 shadow-[0_2px_8px_rgba(58,47,38,0.08)]">
                        <span
                          className="w-full text-center text-[12px] font-extrabold leading-none tabular-nums text-bakery-ink"
                          dir="ltr"
                        >
                          {timeLine}
                        </span>
                      </div>
                    ) : (
                      <p className="min-w-0 flex-1 text-center text-[13px] font-bold text-bakery-ink">
                        {labels.calendarSpotsLeft}
                      </p>
                    )}
                    <p className="min-w-0 flex-1 truncate text-end text-[13px] font-bold text-bakery-muted">
                      {labels.book}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {onOpenCalendar ? (
        <div className="shrink-0 px-2 pb-2.5 pt-0.5">
          <SettingsMenuSubRow
            icon={Calendar}
            title={labels.openCalendar}
            onClick={onOpenCalendar}
          />
        </div>
      ) : null}
    </div>
  );
}
