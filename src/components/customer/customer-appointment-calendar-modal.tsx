"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import type { CustomerLabels } from "./customer-labels";
import {
  CustomerAppointmentCalendar,
  type AppointmentSlot,
} from "./customer-appointment-calendar";
import { CustomerAppointmentDayModal } from "./customer-appointment-day-modal";
import {
  CustomerAppointmentReminderRow,
  hasFullyBookedFutureDays,
} from "./customer-appointment-reminder-row";

export function CustomerAppointmentCalendarModal({
  open,
  onClose,
  slots,
  locale,
  labels,
  orderScheduleEnabled = false,
  orderSchedule = null,
  bookingByDay = false,
  businessSlug,
  customerPhone = "",
  onNeedPhone,
  onBook,
  rentalMode = false,
  storeTheme = "calm",
}: {
  open: boolean;
  onClose: () => void;
  slots: AppointmentSlot[];
  locale: CustomerLocale;
  labels: CustomerLabels;
  orderScheduleEnabled?: boolean;
  orderSchedule?: string | null;
  bookingByDay?: boolean;
  businessSlug: string;
  customerPhone?: string;
  onNeedPhone: () => void;
  onBook: (dateKey: string, daySlots: AppointmentSlot[]) => void;
  rentalMode?: boolean;
  storeTheme?: StoreThemeId;
}) {
  const pickDayTitle = rentalMode
    ? labels.calendarPickCheckIn
    : labels.calendarPickDay;
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedDaySlots, setSelectedDaySlots] = useState<AppointmentSlot[]>([]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSelectedDay(null);
      setSelectedDaySlots([]);
    }
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-label={pickDayTitle}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/60 backdrop-blur-[3px]"
        onClick={onClose}
        aria-label={labels.close}
      />
      <div className="appointments-calendar-frame relative flex max-h-[min(94dvh,780px)] w-full max-w-[min(100%,400px)] flex-col overflow-hidden rounded-[28px] border shadow-[0_12px_40px_rgba(58,47,38,0.1)]">
        <div className="relative flex min-h-[56px] shrink-0 items-center justify-center border-b border-[#5C4A3E]/15 bg-white px-12 py-3.5">
          <h2 className="appointment-day-modal__title w-full text-center text-[22px] font-extrabold leading-tight sm:text-[24px]">
            {pickDayTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-bakery-muted transition hover:bg-bakery-card/80"
            aria-label={labels.close}
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <div className="appointments-calendar-frame-inner no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          <CustomerAppointmentCalendar
            slots={slots}
            locale={locale}
            labels={labels}
            squareDaysLarge
            visualVariant="modern"
            orderScheduleEnabled={orderScheduleEnabled}
            orderSchedule={orderSchedule}
            bookingByDay={bookingByDay}
            highlightedDay={selectedDay}
            onDayOpen={(dateKey, daySlots) => {
              setSelectedDay(dateKey);
              setSelectedDaySlots(daySlots);
            }}
          />
        </div>
        {hasFullyBookedFutureDays(slots) ? (
          <div className="shrink-0 border-t border-bakery-border/25 px-3 py-3">
            <CustomerAppointmentReminderRow
              businessSlug={businessSlug}
              slots={slots}
              labels={labels}
              customerPhone={customerPhone}
              onNeedPhone={onNeedPhone}
            />
          </div>
        ) : null}
      </div>
      <CustomerAppointmentDayModal
        open={!!selectedDay}
        onClose={() => {
          setSelectedDay(null);
          setSelectedDaySlots([]);
        }}
        dateKey={selectedDay}
        slots={selectedDaySlots}
        locale={locale}
        labels={labels}
        orderScheduleEnabled={orderScheduleEnabled}
        orderSchedule={orderSchedule}
        bookingByDay={bookingByDay}
        rentalMode={rentalMode}
        storeTheme={storeTheme}
        onBook={(dateKey, daySlots) => {
          onBook(dateKey, daySlots);
          onClose();
        }}
      />
    </div>,
    document.body
  );
}
