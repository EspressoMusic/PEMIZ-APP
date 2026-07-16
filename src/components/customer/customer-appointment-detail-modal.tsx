"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import type { CustomerLabels } from "@/components/customer/customer-labels";
import { CustomerCenterModal } from "@/components/customer/customer-center-modal";
import type { CustomerLocale } from "@/lib/customer-preferences";
import {
  formatAppointmentDateTime,
  parseCustomerNoteFromNotes,
  type CustomerAppointmentEntry,
} from "@/lib/customer-appointment-history";
import { formatRentalPeriodLine } from "@/lib/rental-period";
import type { StoreThemeId } from "@/lib/store-themes";

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="rounded-[14px] border border-[#6D4C41]/14 bg-[#fffdf8] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
      <p className="text-[12px] font-bold text-bakery-muted">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap text-[15px] font-extrabold leading-snug text-bakery-ink">
        {value}
      </p>
    </div>
  );
}

function appointmentStatusLabel(
  status: string,
  labels: CustomerLabels
): string {
  if (status === "CANCELLED") return labels.appointmentCancelled;
  if (status === "PENDING") return labels.appointmentPending;
  return labels.appointmentConfirmed;
}

function formatWhenLabel(
  appointment: CustomerAppointmentEntry,
  rentalMode: boolean,
  locale: CustomerLocale,
  labels: CustomerLabels
): string {
  if (rentalMode) {
    return formatRentalPeriodLine(appointment.startAt, appointment.endAt, locale, {
      rentalNight: labels.rentalNight,
      rentalNights: labels.rentalNights,
      rentalDay: labels.rentalDay,
      rentalDays: labels.rentalDays,
    });
  }
  const start = formatAppointmentDateTime(appointment.startAt, locale);
  if (!appointment.endAt || appointment.endAt === appointment.startAt) {
    return start;
  }
  const endDate = new Date(appointment.endAt);
  const endTime = endDate.toLocaleTimeString(locale === "he" ? "he-IL" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${start} – ${endTime}`;
}

export function CustomerAppointmentDetailModal({
  open,
  onClose,
  appointment,
  locale,
  labels,
  storeTheme = "turquoise",
  rentalMode = false,
  canCancel,
  cancelling = false,
  onCancel,
}: {
  open: boolean;
  onClose: () => void;
  appointment: CustomerAppointmentEntry | null;
  locale: CustomerLocale;
  labels: CustomerLabels;
  storeTheme?: StoreThemeId;
  rentalMode?: boolean;
  canCancel: boolean;
  cancelling?: boolean;
  onCancel?: () => void | Promise<void>;
}) {
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (!open) setConfirmCancel(false);
  }, [open, appointment?.id]);

  const customerNote = appointment
    ? parseCustomerNoteFromNotes(appointment.notes)
    : "";

  return (
    <CustomerCenterModal
      open={open}
      onClose={onClose}
      title={labels.appointmentDetails}
      locale={locale}
      storeTheme={storeTheme}
      ariaLabel={labels.appointmentDetails}
      panelClassName="customer-appointment-detail-modal-panel"
      bodyClassName="px-3 py-4"
    >
      {appointment ? (
        <div className="space-y-3">
          <DetailRow label={labels.service} value={appointment.serviceName} />
          <DetailRow
            label={labels.appointmentDateTime}
            value={formatWhenLabel(appointment, rentalMode, locale, labels)}
          />
          <DetailRow
            label={labels.appointmentStatusLabel}
            value={appointmentStatusLabel(appointment.status, labels)}
          />
          <DetailRow label={labels.name} value={appointment.customerName} />
          <DetailRow label={labels.phone} value={appointment.customerPhone} />
          {customerNote ? (
            <DetailRow label={labels.appointmentNotes} value={customerNote} />
          ) : null}
          <DetailRow
            label={labels.appointmentBookedAt}
            value={formatAppointmentDateTime(appointment.bookedAt, locale)}
          />

          {appointment.status === "CANCELLED" ? null : canCancel && onCancel ? (
            confirmCancel ? (
              <div className="space-y-2 pt-1">
                <p className="text-center text-[14px] font-semibold leading-snug text-bakery-muted">
                  {labels.cancelAppointmentConfirm}
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="danger"
                    className="w-full font-extrabold"
                    disabled={cancelling}
                    onClick={() => void onCancel()}
                  >
                    {cancelling
                      ? labels.bookingSubmitting
                      : labels.confirmCancelAppointment}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full font-extrabold"
                    disabled={cancelling}
                    onClick={() => setConfirmCancel(false)}
                  >
                    {labels.close}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="danger"
                className="mt-1 w-full font-extrabold"
                onClick={() => setConfirmCancel(true)}
              >
                {labels.cancelAppointment}
              </Button>
            )
          ) : new Date(appointment.startAt).getTime() > Date.now() ? (
            <p className="rounded-[14px] border border-[#6D4C41]/14 bg-[#fffdf8] px-3 py-2.5 text-center text-[13px] font-semibold leading-snug text-bakery-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
              {labels.cancelAppointmentBlocked}
            </p>
          ) : null}
        </div>
      ) : null}
    </CustomerCenterModal>
  );
}
