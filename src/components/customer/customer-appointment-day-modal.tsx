"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
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

export function CustomerAppointmentDayModal({
  open,
  onClose,
  dateKey,
  slots,
  locale,
  labels,
  orderScheduleEnabled = false,
  orderSchedule = null,
  bookingByDay = false,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  dateKey: string | null;
  slots: AppointmentSlot[];
  locale: CustomerLocale;
  labels: CustomerLabels;
  orderScheduleEnabled?: boolean;
  orderSchedule?: string | null;
  bookingByDay?: boolean;
  onBook: (dateKey: string, daySlots: AppointmentSlot[]) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !dateKey || typeof document === "undefined") return null;

  const appLocale = locale === "he" ? "he" : "en";
  const title = formatAppointmentDayTitle(dateKey, appLocale);
  const closed = !isSellerWorkingDay(dateKey, orderScheduleEnabled, orderSchedule);
  const sortedSlots = [...slots].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );
  const openSlots = sortedSlots.filter(appointmentSlotIsOpen);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={labels.calendarDayViewTitle}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={labels.close}
      />
      <div className="relative flex max-h-[min(88dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-[24px] border-[3px] border-[#5C4A3E]/22 bg-bakery-square shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
        <div className="relative flex min-h-[52px] shrink-0 items-center justify-center border-b border-bakery-border/25 px-12 py-3">
          <h2 className="w-full text-center text-[17px] font-extrabold leading-tight text-bakery-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute end-2 top-1/2 -translate-y-1/2 shrink-0 rounded-full p-1.5 text-bakery-muted transition hover:bg-bakery-card/80"
            aria-label={labels.close}
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
          {closed ? (
            <p className="rounded-[16px] border border-bakery-border/30 bg-bakery-card/70 px-4 py-6 text-center text-[14px] font-semibold text-bakery-muted">
              {labels.calendarDayClosedHint}
            </p>
          ) : sortedSlots.length === 0 ? (
            <p className="rounded-[16px] border border-bakery-border/30 bg-bakery-card/70 px-4 py-6 text-center text-[14px] font-semibold text-bakery-muted">
              {labels.calendarNoSlotsDay}
            </p>
          ) : (
            <>
              <p className="text-center text-[13px] font-bold text-bakery-muted">
                {labels.calendarDayAllSlots}
              </p>
              <ul className="space-y-2">
                {sortedSlots.map((slot) => {
                  const isOpen = appointmentSlotIsOpen(slot);
                  const isPast = new Date(slot.startAt) <= new Date();
                  const spotsLeft = slot.maxBookings - slot.appointments.length;
                  const statusLabel = isPast
                    ? labels.calendarSlotPast
                    : isOpen
                      ? `${spotsLeft} ${labels.calendarSpotsLeft}`
                      : labels.calendarSlotFull;

                  return (
                    <li key={slot.id}>
                      <div className="flex items-center gap-2 rounded-[16px] border border-bakery-border/35 bg-bakery-card px-3 py-2.5">
                        <div className="flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border-[2px] border-bakery-border/40 bg-[#F2EBE0] px-0.5">
                          <span
                            className="w-full text-center text-[12px] font-extrabold leading-none tabular-nums text-bakery-ink"
                            dir="ltr"
                          >
                            {formatSlotTime(slot.startAt, locale)}
                          </span>
                        </div>
                        <p className="min-w-0 flex-1 text-[13px] font-bold text-bakery-muted">
                          {statusLabel}
                        </p>
                        {isOpen ? (
                          <Button
                            type="button"
                            variant="primary"
                            className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-extrabold"
                            onClick={() => {
                              onBook(
                                dateKey,
                                bookingByDay ? openSlots : [slot]
                              );
                              onClose();
                            }}
                          >
                            {labels.book}
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
