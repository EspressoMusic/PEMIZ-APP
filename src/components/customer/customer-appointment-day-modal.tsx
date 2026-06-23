"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { customerThemeClass, type StoreThemeId } from "@/lib/store-themes";
import { formatAppointmentDayTitle } from "@/lib/appointment-calendar-shared";
import type { CustomerLabels } from "./customer-labels";
import type { AppointmentSlot } from "./customer-appointment-calendar";
import { CustomerAppointmentSlotPicker } from "./customer-appointment-slot-picker";

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
  rentalMode = false,
  storeTheme = "calm",
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
  rentalMode?: boolean;
  storeTheme?: StoreThemeId;
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
  const themeClass = customerThemeClass(storeTheme);

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={rentalMode ? labels.calendarPickCheckIn : labels.calendarPickTime}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/60 backdrop-blur-[3px]"
        onClick={onClose}
        aria-label={labels.close}
      />
      <div
        className={`customer-store-root ${themeClass} appointment-day-modal relative flex max-h-[min(80dvh,560px)] w-full max-w-md flex-col overflow-hidden rounded-[28px]`}
      >
        <div className="appointment-day-modal__header relative flex min-h-[52px] shrink-0 items-center justify-center px-12 py-3">
          <h2 className="appointment-day-modal__title w-full text-center text-[17px] font-extrabold leading-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="appointment-day-modal__close absolute end-2 top-1/2 -translate-y-1/2 shrink-0 rounded-full p-1.5 transition"
            aria-label={labels.close}
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="appointment-day-modal__body no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
          <CustomerAppointmentSlotPicker
            dateKey={dateKey}
            slots={slots}
            locale={locale}
            labels={labels}
            orderScheduleEnabled={orderScheduleEnabled}
            orderSchedule={orderSchedule}
            bookingByDay={bookingByDay}
            rentalMode={rentalMode}
            hideHeader
            fillScroll
            onBook={(dk, daySlots) => {
              onBook(dk, daySlots);
              onClose();
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
