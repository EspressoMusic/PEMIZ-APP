"use client";

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
  const sortedSlots = [...slots]
    .filter((s) => new Date(s.startAt) > new Date())
    .sort(
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
        <p className="appointment-day-modal__title text-center text-[15px] font-extrabold leading-snug">
          {title}
        </p>
      ) : null}

      {closed ? (
        <p className="appointment-slot-empty rounded-[16px] px-4 py-5 text-center text-[14px] font-semibold">
          {labels.calendarDayClosedHint}
        </p>
      ) : sortedSlots.length === 0 ? (
        <p className="appointment-slot-empty rounded-[16px] px-4 py-5 text-center text-[14px] font-semibold">
          {labels.calendarNoSlotsDay}
        </p>
      ) : bookingByDay ? (
        openSlots.length > 0 ? (
          <button
            type="button"
            className="appointment-slot-day-btn"
            onClick={() => onBook(dateKey, openSlots)}
          >
            {rentalMode ? labels.scheduleRental : labels.book}
          </button>
        ) : (
          <p className="appointment-slot-empty rounded-[16px] px-4 py-5 text-center text-[14px] font-semibold">
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
                  className={`appointment-slot-row flex items-center gap-2 px-3 py-2.5 ${
                    isOpen
                      ? "appointment-slot-row--open"
                      : isFull
                        ? "appointment-slot-row--full"
                        : "appointment-slot-row--past"
                  }`}
                >
                  <span
                    className={`appointment-slot-time shrink-0 text-[22px] leading-none sm:text-[24px] ${
                      isOpen
                        ? ""
                        : isFull
                          ? "appointment-slot-time--full"
                          : "appointment-slot-time--past"
                    }`}
                    dir="ltr"
                  >
                    {formatSlotTime(slot.startAt, locale)}
                  </span>
                  {isOpen ? (
                    <button
                      type="button"
                      className="appointment-slot-book-btn ms-auto shrink-0 px-3 py-1.5 text-[12px]"
                      onClick={() =>
                        onBook(dateKey, bookingByDay ? openSlots : [slot])
                      }
                    >
                      {labels.book}
                    </button>
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
