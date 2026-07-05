"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  customerProfileInitial,
  type CustomerProfileInput,
} from "@/components/dashboard/dashboard-customer-profile";
import {
  parseCustomerNoteFromNotes,
  parseServiceFromNotes,
} from "@/lib/customer-appointment-history";
import { appointmentLocalDateKey } from "@/lib/appointment-calendar-shared";
import {
  formatRentalPeriodCompact,
  formatRentalPeriodLine,
} from "@/lib/rental-period";
import type { DashboardLabels } from "@/lib/app-locale";
import {
  isSellerSelfBooking,
  SELLER_SELF_BOOKING_NOTE,
} from "@/lib/seller-appointment-booking";

export const DASHBOARD_DAY_PANEL_HALO =
  "shadow-[0_0_0_6px_rgba(92,74,62,0.12),0_6px_20px_rgba(58,47,38,0.15)]";

export const DASHBOARD_NEXT_APPOINTMENT_FRAME =
  "!border-[3px] !border-[#b85c5c] shadow-[0_0_0_5px_rgba(184,92,92,0.18),0_6px_18px_rgba(184,92,92,0.14)]";

export type DashboardAppointmentView = {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  notes?: string | null;
  sellerHiddenAt?: string | null;
  slot: { startAt: string; endAt: string };
};

function formatAppointmentTimeLine(iso: string, locale: "he" | "en") {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(locale === "he" ? "he-IL" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAppointmentDateLabel(
  iso: string,
  locale: "he" | "en",
  labels: Pick<DashboardLabels, "appointmentToday" | "appointmentTomorrow">
) {
  const key = appointmentLocalDateKey(iso);
  const todayKey = appointmentLocalDateKey(new Date().toISOString());
  if (key === todayKey) return labels.appointmentToday;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = appointmentLocalDateKey(tomorrow.toISOString());
  if (key === tomorrowKey) return labels.appointmentTomorrow;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function DashboardAppointmentDetailModal({
  open,
  onClose,
  appointment,
  onHide,
}: {
  open: boolean;
  onClose: () => void;
  appointment: DashboardAppointmentView;
  onHide?: () => void;
}) {
  const { labels, locale, formatDateTime } = useAppLocale();
  const sellerBooking = isSellerSelfBooking(appointment);
  const displayName = sellerBooking
    ? labels.sellerSelfBooking
    : appointment.customerName;
  const serviceName = parseServiceFromNotes(appointment.notes);
  const customerNote = parseCustomerNoteFromNotes(appointment.notes).replace(
    SELLER_SELF_BOOKING_NOTE,
    ""
  ).trim();
  const dateLabel = formatAppointmentDateLabel(
    appointment.slot.startAt,
    locale,
    labels
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={displayName}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={labels.close}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border-[3px] border-bakery-primary/22 bg-bakery-card shadow-none">
        <button
          type="button"
          onClick={onClose}
          className="absolute end-3 top-3 z-10 rounded-full p-1.5 text-bakery-muted transition hover:bg-bakery-card/80"
          aria-label={labels.close}
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>

        <div className="space-y-4 px-4 pb-4 pt-5 text-center" dir="rtl">
          <div className="flex items-center justify-center gap-3.5 px-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-bakery-border/35 bg-bakery-on-primary text-[26px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]">
              {customerProfileInitial(displayName, labels.anonymousCustomer)}
            </div>
            <h2 className="min-w-0 text-start text-[22px] font-extrabold leading-tight text-bakery-ink sm:text-[24px]">
              {displayName}
            </h2>
          </div>

          <div className="space-y-3 rounded-[18px] border border-bakery-border/35 bg-bakery-card px-4 py-4 text-center">
            {sellerBooking ? (
              <div>
                <p className="text-[13px] font-bold text-bakery-muted">
                  {labels.appointmentService}
                </p>
                <p className="text-[18px] font-extrabold text-bakery-ink">
                  {labels.sellerSelfBooking}
                </p>
              </div>
            ) : serviceName ? (
              <div>
                <p className="text-[13px] font-bold text-bakery-muted">
                  {labels.appointmentService}
                </p>
                <p className="text-[18px] font-extrabold text-bakery-ink">
                  {serviceName}
                </p>
              </div>
            ) : null}

            {!sellerBooking && appointment.customerPhone ? (
              <div>
                <p className="text-[13px] font-bold text-bakery-muted">
                  {labels.phone}
                </p>
                <p
                  className="text-[18px] font-extrabold tabular-nums text-bakery-ink"
                  dir="ltr"
                >
                  {appointment.customerPhone}
                </p>
              </div>
            ) : null}

            <div>
              <p className="text-[13px] font-bold text-bakery-muted">
                {labels.appointmentSlotTime}
              </p>
              <p className="text-[18px] font-extrabold text-bakery-ink">
                {dateLabel} ·{" "}
                <span dir="ltr" className="tabular-nums">
                  {formatAppointmentTimeLine(appointment.slot.startAt, locale)}
                </span>
              </p>
              <p
                className="mt-0.5 text-[15px] font-semibold text-bakery-muted"
                dir="ltr"
              >
                {formatDateTime(appointment.slot.startAt)}
              </p>
            </div>

            {customerNote ? (
              <div>
                <p className="text-[13px] font-bold text-bakery-muted">
                  {labels.appointmentCustomerNote}
                </p>
                <p className="whitespace-pre-wrap text-[16px] font-semibold leading-snug text-bakery-ink">
                  {customerNote}
                </p>
              </div>
            ) : null}

            {appointment.status === "CANCELLED" ? (
              <p className="text-[15px] font-bold text-bakery-muted">
                {labels.appointmentCancelled}
              </p>
            ) : null}
          </div>

          {onHide ? (
            <Button
              type="button"
              className="w-full min-h-[44px] rounded-full border-[2px] border-bakery-primary bg-bakery-primary font-extrabold text-bakery-on-primary shadow-none hover:opacity-95 active:scale-[0.98]"
              onClick={() => {
                onHide();
                onClose();
              }}
            >
              {labels.hide}
            </Button>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function DashboardAppointmentCard({
  appointment,
  onHide,
  onCustomerClick,
  outlined = false,
  highlightAsNext = false,
  relativeDateLabels = true,
  homeList = false,
  rentalMode = false,
}: {
  appointment: DashboardAppointmentView;
  onHide?: () => void;
  onCustomerClick?: (input: CustomerProfileInput) => void;
  bookingByDay?: boolean;
  rentalMode?: boolean;
  outlined?: boolean;
  /** Closest upcoming appointment — matte red frame on home list. */
  highlightAsNext?: boolean;
  /** היום/מחר — only after client hydration to avoid SSR mismatch. */
  relativeDateLabels?: boolean;
  /** דף הבית — בלי שם שירות/הערות בשורת הרשימה. */
  homeList?: boolean;
}) {
  const { labels, locale } = useAppLocale();
  const [detailOpen, setDetailOpen] = useState(false);
  const sellerBooking = isSellerSelfBooking(appointment);
  const displayName = sellerBooking
    ? labels.sellerSelfBooking
    : appointment.customerName;
  const serviceName = parseServiceFromNotes(appointment.notes);
  const dateLabel = useMemo(() => {
    if (!relativeDateLabels) {
      const date = new Date(appointment.slot.startAt);
      if (Number.isNaN(date.getTime())) return appointment.slot.startAt;
      return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
    }
    return formatAppointmentDateLabel(appointment.slot.startAt, locale, labels);
  }, [appointment.slot.startAt, locale, labels, relativeDateLabels]);
  const rentalLabels = useMemo(
    () => ({
      rentalNight: labels.rentalNight,
      rentalNights: labels.rentalNights,
      rentalDay: labels.rentalDay,
      rentalDays: labels.rentalDays,
    }),
    [labels]
  );
  const timeLine = useMemo(() => {
    if (rentalMode) {
      return formatRentalPeriodCompact(
        appointment.slot.startAt,
        appointment.slot.endAt,
        locale,
        rentalLabels
      );
    }
    return formatAppointmentTimeLine(appointment.slot.startAt, locale);
  }, [
    rentalMode,
    appointment.slot.startAt,
    appointment.slot.endAt,
    locale,
    rentalLabels,
  ]);
  const rentalPeriodLine = useMemo(() => {
    if (!rentalMode) return "";
    return formatRentalPeriodLine(
      appointment.slot.startAt,
      appointment.slot.endAt,
      locale,
      rentalLabels
    );
  }, [rentalMode, appointment.slot.startAt, appointment.slot.endAt, locale, rentalLabels]);

  const canOpenCustomerProfile =
    !sellerBooking &&
    Boolean(onCustomerClick) &&
    Boolean(appointment.customerPhone?.trim());

  return (
    <>
      <div
        dir="ltr"
        className={`dashboard-action-square flex w-full items-center gap-2 rounded-[22px] px-3 py-3.5 ${
          highlightAsNext
            ? DASHBOARD_NEXT_APPOINTMENT_FRAME
            : outlined
              ? `!border-[3px] !border-bakery-primary/18 ${DASHBOARD_DAY_PANEL_HALO}`
              : ""
        }`}
      >
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-2 text-start transition hover:opacity-95 active:scale-[0.99]"
          aria-label={`${labels.appointments}: ${displayName}`}
        >
          <p
            className="w-[4.25rem] shrink-0 text-[12px] font-extrabold leading-tight text-bakery-ink"
            suppressHydrationWarning
          >
            {dateLabel}
          </p>

          {timeLine ? (
            <span
              className={`shrink-0 text-center font-extrabold leading-tight text-bakery-ink ${
                rentalMode
                  ? homeList
                    ? "min-w-0 flex-1 text-[14px] sm:text-[15px]"
                    : "min-w-0 flex-1 text-[15px]"
                  : `text-[22px] leading-none tabular-nums sm:text-[24px] ${
                      homeList ? "min-w-0 flex-1" : "w-[4.5rem]"
                    }`
              }`}
              dir="ltr"
            >
              {rentalMode && !homeList ? rentalPeriodLine : timeLine}
            </span>
          ) : (
            <span className={homeList ? "min-w-0 flex-1" : "w-[4.5rem] shrink-0"} aria-hidden />
          )}

          {!homeList ? (
            <p className="min-w-0 flex-1 truncate text-center text-[13px] font-bold text-bakery-ink">
              {serviceName || "\u00a0"}
            </p>
          ) : null}

          <p
            className={`min-w-0 truncate text-right text-[15px] font-extrabold leading-tight text-bakery-ink ${
              homeList ? "max-w-[48%] flex-1" : "max-w-[38%]"
            }`}
            dir="rtl"
          >
            {displayName}
          </p>
        </button>

        {canOpenCustomerProfile ? (
          <button
            type="button"
            onClick={() =>
              onCustomerClick?.({
                customerName: appointment.customerName,
                customerPhone: appointment.customerPhone,
                fallbackDate: appointment.slot.startAt,
              })
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-bakery-border/35 bg-bakery-on-primary text-[16px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)] transition hover:opacity-90 active:scale-[0.98]"
            aria-label={`${labels.customer}: ${displayName}`}
          >
            {customerProfileInitial(displayName, labels.anonymousCustomer)}
          </button>
        ) : (
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-bakery-border/35 bg-bakery-on-primary text-[16px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]"
            aria-hidden
          >
            {customerProfileInitial(displayName, labels.anonymousCustomer)}
          </span>
        )}
      </div>

      <DashboardAppointmentDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        appointment={appointment}
        onHide={onHide}
      />
    </>
  );
}
