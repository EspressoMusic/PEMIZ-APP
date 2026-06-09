"use client";

import { Button } from "@/components/ui";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { formatAppointmentDayTitle } from "@/lib/appointment-calendar-shared";
import { isSellerWorkingDay } from "@/lib/order-schedule";
import type { CustomerLabels } from "./customer-labels";
import {
  appointmentSlotIsOpen,
  type AppointmentSlot,
} from "./customer-appointment-calendar";

function formatSlotTime(iso: string, locale: CustomerLocale) {
  return new Date(iso).toLocaleTimeString(locale === "he" ? "he-IL" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CustomerAppointmentSlotPicker({
  dateKey,
  slots,
  locale,
  labels,
  orderScheduleEnabled = false,
  orderSchedule = null,
  bookingByDay = false,
  rentalMode = false,
  hideHeader = false,
  fillScroll = false,
  onBook,
}: {
  dateKey: string;
  slots: AppointmentSlot[];
  locale: CustomerLocale;
  labels: CustomerLabels;
  orderScheduleEnabled?: boolean;
  orderSchedule?: string | null;
  bookingByDay?: boolean;
  rentalMode?: boolean;
  /** Hide day title — used when the parent modal already shows it. */
  hideHeader?: boolean;
  /** Let the parent scroll the list (day picker modal). */
  fillScroll?: boolean;
  onBook: (dateKey: string, daySlots: AppointmentSlot[]) => void;
}) {
  const appLocale = locale === "he" ? "he" : "en";
  const title = formatAppointmentDayTitle(dateKey, appLocale);
  const closed = !isSellerWorkingDay(dateKey, orderScheduleEnabled, orderSchedule);
  const sortedSlots = [...slots].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );
  const openSlots = sortedSlots.filter(appointmentSlotIsOpen);

  return (
    <div
      className={
        hideHeader ? "space-y-2" : "space-y-2 border-t border-bakery-border/25 pt-3"
      }
    >
      {!hideHeader ? (
        <p className="text-center text-[15px] font-extrabold leading-snug text-bakery-ink">
          {title}
        </p>
      ) : null}

      {closed ? (
        <p className="rounded-[16px] border border-bakery-border/30 bg-bakery-card/70 px-4 py-5 text-center text-[14px] font-semibold text-bakery-muted">
          {labels.calendarDayClosedHint}
        </p>
      ) : sortedSlots.length === 0 ? (
        <p className="rounded-[16px] border border-bakery-border/30 bg-bakery-card/70 px-4 py-5 text-center text-[14px] font-semibold text-bakery-muted">
          {labels.calendarNoSlotsDay}
        </p>
      ) : bookingByDay ? (
        openSlots.length > 0 ? (
          <Button
            type="button"
            variant="primary"
            className="w-full min-h-[48px] rounded-[16px] text-[15px] font-extrabold"
            onClick={() => onBook(dateKey, openSlots)}
          >
            {rentalMode ? labels.scheduleRental : labels.book}
          </Button>
        ) : (
          <p className="rounded-[16px] border border-bakery-border/30 bg-bakery-card/70 px-4 py-5 text-center text-[14px] font-semibold text-bakery-muted">
            {labels.calendarNoSlotsDay}
          </p>
        )
      ) : (
        <ul
          className={
            fillScroll
              ? "space-y-2 pe-0.5"
              : "max-h-[min(36dvh,280px)] space-y-2 overflow-y-auto overscroll-contain pe-0.5"
          }
        >
          {sortedSlots.map((slot) => {
            const isOpen = appointmentSlotIsOpen(slot);
            const isPast = new Date(slot.startAt) <= new Date();
            const isFull = !isPast && !isOpen;

            return (
              <li key={slot.id}>
                <div
                  className={`flex items-center gap-2 rounded-[16px] border px-3 py-2.5 ${
                    isOpen
                      ? "border-bakery-primary/35 bg-bakery-card"
                      : isFull
                        ? "border-[#b85c5c]/35 bg-[#faf0ee]"
                        : "border-bakery-border/25 bg-bakery-card/55 opacity-80"
                  }`}
                >
                  <span
                    className={`shrink-0 tabular-nums text-[22px] font-extrabold leading-none sm:text-[24px] ${
                      isOpen
                        ? "text-bakery-ink"
                        : isFull
                          ? "text-[#9a4545]"
                          : "text-bakery-muted"
                    }`}
                    dir="ltr"
                  >
                    {formatSlotTime(slot.startAt, locale)}
                  </span>
                  {isOpen ? (
                    <Button
                      type="button"
                      variant="primary"
                      className="ms-auto shrink-0 rounded-full px-3 py-1.5 text-[12px] font-extrabold"
                      onClick={() =>
                        onBook(dateKey, bookingByDay ? openSlots : [slot])
                      }
                    >
                      {labels.book}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
