"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { customerProfileInitial } from "@/components/dashboard/dashboard-customer-profile";
import {
  parseCustomerNoteFromNotes,
  parseServiceFromNotes,
} from "@/lib/customer-appointment-history";
import { appointmentLocalDateKey } from "@/lib/appointment-calendar-shared";
import type { DashboardLabels } from "@/lib/app-locale";

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
  const serviceName = parseServiceFromNotes(appointment.notes);
  const customerNote = parseCustomerNoteFromNotes(appointment.notes);
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
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={appointment.customerName}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={labels.close}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border-[3px] border-[#5C4A3E]/22 bg-bakery-square shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
        <div className="relative flex min-h-[52px] items-center justify-center border-b border-bakery-border/25 px-12 py-3">
          <h2 className="w-full text-center text-[17px] font-extrabold leading-tight text-bakery-ink">
            {appointment.customerName}
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

        <div className="space-y-3 px-4 py-4 text-center" dir="rtl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-[16px] border border-bakery-border/35 bg-bakery-on-primary text-[22px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]">
            {customerProfileInitial(
              appointment.customerName,
              labels.anonymousCustomer
            )}
          </div>

          <div className="space-y-2 rounded-[18px] border border-bakery-border/35 bg-bakery-card px-3 py-3 text-start">
            {serviceName ? (
              <div>
                <p className="text-[11px] font-bold text-bakery-muted">
                  {labels.appointmentService}
                </p>
                <p className="text-[15px] font-extrabold text-bakery-ink">
                  {serviceName}
                </p>
              </div>
            ) : null}

            <div>
              <p className="text-[11px] font-bold text-bakery-muted">
                {labels.appointmentSlotTime}
              </p>
              <p className="text-[15px] font-extrabold text-bakery-ink">
                {dateLabel} ·{" "}
                <span dir="ltr" className="tabular-nums">
                  {formatAppointmentTimeLine(appointment.slot.startAt, locale)}
                </span>
              </p>
              <p className="mt-0.5 text-[13px] font-semibold text-bakery-muted" dir="ltr">
                {formatDateTime(appointment.slot.startAt)}
              </p>
            </div>

            {customerNote ? (
              <div>
                <p className="text-[11px] font-bold text-bakery-muted">
                  {labels.appointmentCustomerNote}
                </p>
                <p className="whitespace-pre-wrap text-[14px] font-semibold leading-snug text-bakery-ink">
                  {customerNote}
                </p>
              </div>
            ) : null}

            {appointment.status === "CANCELLED" ? (
              <p className="text-[13px] font-bold text-bakery-muted">
                {labels.appointmentCancelled}
              </p>
            ) : null}
          </div>

          {onHide ? (
            <Button
              type="button"
              className="w-full min-h-[44px] rounded-full border-[2px] border-[#5C4A3E]/55 bg-[#5C4A3E] font-extrabold text-bakery-on-primary shadow-[var(--shadow-bakery-btn)] hover:bg-[#5C4A3E]/95 active:scale-[0.98]"
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
  outlined = false,
}: {
  appointment: DashboardAppointmentView;
  onHide?: () => void;
  bookingByDay?: boolean;
  outlined?: boolean;
}) {
  const { labels, locale } = useAppLocale();
  const [detailOpen, setDetailOpen] = useState(false);
  const serviceName = parseServiceFromNotes(appointment.notes);
  const dateLabel = useMemo(
    () =>
      formatAppointmentDateLabel(appointment.slot.startAt, locale, labels),
    [appointment.slot.startAt, locale, labels]
  );
  const timeLine = useMemo(
    () => formatAppointmentTimeLine(appointment.slot.startAt, locale),
    [appointment.slot.startAt, locale]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setDetailOpen(true)}
        dir="ltr"
        className={`dashboard-action-square flex w-full items-center gap-2 rounded-[22px] px-3 py-3.5 text-start transition hover:opacity-95 active:scale-[0.99] ${
          outlined ? "!border-[3px] !border-[#5C4A3E]/22" : ""
        }`}
        aria-label={`${labels.appointments}: ${appointment.customerName}`}
      >
        <p className="w-[4.25rem] shrink-0 text-[12px] font-extrabold leading-tight text-bakery-ink">
          {dateLabel}
        </p>

        <div className="flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border-[2px] border-bakery-border/40 bg-[#F2EBE0] px-0.5 shadow-[0_2px_8px_rgba(58,47,38,0.08)]">
          {timeLine ? (
            <span
              className="w-full text-center text-[12px] font-extrabold leading-none tabular-nums text-bakery-ink"
              dir="ltr"
            >
              {timeLine}
            </span>
          ) : null}
        </div>

        <p className="min-w-0 flex-1 truncate text-center text-[13px] font-bold text-bakery-ink">
          {serviceName || "\u00a0"}
        </p>

        <div className="flex min-w-0 max-w-[42%] items-center justify-end gap-1.5">
          <p
            className="min-w-0 truncate text-right text-[15px] font-extrabold leading-tight text-bakery-ink"
            dir="rtl"
          >
            {appointment.customerName}
          </p>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-bakery-border/35 bg-bakery-on-primary text-[16px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]"
            aria-hidden
          >
            {customerProfileInitial(
              appointment.customerName,
              labels.anonymousCustomer
            )}
          </span>
        </div>
      </button>

      <DashboardAppointmentDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        appointment={appointment}
        onHide={onHide}
      />
    </>
  );
}
