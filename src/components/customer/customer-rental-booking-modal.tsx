"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import {
  CustomerCenterModal,
  CustomerModalHeaderBar,
} from "@/components/customer/customer-center-modal";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import { isValidPhone } from "@/lib/phone";
import {
  addDaysToDateKey,
  dateKeyFromIso,
  formatRentalPeriodLine,
  isoAtLocalTime,
} from "@/lib/rental-period";
import type { CustomerLabels } from "./customer-labels";
import type { AppointmentSlot } from "./customer-appointment-calendar";
import { CustomerServicePicker } from "./customer-service-picker";

function formatDayTitle(dateKey: string, locale: CustomerLocale) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type ServiceOption = { id: string; name: string };

export function CustomerRentalBookingModal({
  open,
  onClose,
  checkInDateKey,
  slots,
  services,
  locale,
  labels,
  storeTheme = "turquoise",
  initialName,
  initialPhone,
  submitting,
  error,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  checkInDateKey: string | null;
  slots: AppointmentSlot[];
  services: ServiceOption[];
  locale: CustomerLocale;
  labels: CustomerLabels;
  storeTheme?: StoreThemeId;
  initialName: string;
  initialPhone: string;
  submitting: boolean;
  error?: string;
  onSubmit: (payload: {
    slotId: string;
    checkInDateKey: string;
    checkOutDateKey: string;
    name: string;
    phone: string;
    serviceName: string;
    notes: string;
  }) => void | Promise<void>;
}) {
  const [checkOutDateKey, setCheckOutDateKey] = useState("");
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [serviceId, setServiceId] = useState("");
  const [notes, setNotes] = useState("");

  const slot = useMemo(() => {
    if (!checkInDateKey) return null;
    return (
      slots.find(
        (s) =>
          dateKeyFromIso(s.startAt) === checkInDateKey &&
          s.appointments.length < s.maxBookings &&
          new Date(s.startAt) > new Date()
      ) ?? null
    );
  }, [checkInDateKey, slots]);

  const minCheckout = checkInDateKey
    ? addDaysToDateKey(checkInDateKey, 1)
    : "";

  const periodPreview = useMemo(() => {
    if (!checkInDateKey || !checkOutDateKey) return "";
    const startAt = isoAtLocalTime(checkInDateKey, 15, 0);
    const endAt = isoAtLocalTime(checkOutDateKey, 11, 0);
    return formatRentalPeriodLine(startAt, endAt, locale, {
      rentalNight: labels.rentalNight,
      rentalNights: labels.rentalNights,
      rentalDay: labels.rentalDay,
      rentalDays: labels.rentalDays,
    });
  }, [checkInDateKey, checkOutDateKey, locale, labels]);

  useEffect(() => {
    if (!open || !checkInDateKey) return;
    setCheckOutDateKey(addDaysToDateKey(checkInDateKey, 1));
    setName(initialName);
    setPhone(initialPhone);
    setServiceId(services[0]?.id ?? "");
    setNotes("");
  }, [open, checkInDateKey, initialName, initialPhone, services]);

  const selectedService = services.find((s) => s.id === serviceId);
  const serviceName = selectedService?.name ?? "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!checkInDateKey || !slot || !checkOutDateKey) return;
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (trimmedName.length < 2 || !isValidPhone(trimmedPhone)) return;
    if (serviceName.length < 1) return;
    if (checkOutDateKey <= checkInDateKey) return;
    void onSubmit({
      slotId: slot.id,
      checkInDateKey,
      checkOutDateKey,
      name: trimmedName,
      phone: trimmedPhone,
      serviceName,
      notes: notes.trim(),
    });
  }

  if (!checkInDateKey) return null;

  const closeLabel = locale === "he" ? "סגור" : "Close";

  return (
    <CustomerCenterModal
      open={open}
      onClose={onClose}
      locale={locale}
      storeTheme={storeTheme}
      bodyClassName="px-4 py-4 overflow-y-auto"
      panelClassName="customer-order-detail-modal-panel max-h-[min(90dvh,640px)]"
      header={
        <CustomerModalHeaderBar
          title={labels.rentalBookingTitle}
          onClose={onClose}
          closeLabel={closeLabel}
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-start">
        {error ? (
          <p
            role="alert"
            className="rounded-2xl bg-bakery-error/10 px-3 py-2 text-[14px] font-semibold text-bakery-error"
          >
            {error}
          </p>
        ) : null}

        <div className="rounded-2xl border border-bakery-border/35 bg-bakery-input/80 px-3 py-3">
          <p className="text-[12px] font-bold text-bakery-muted">
            {labels.rentalCheckIn}
          </p>
          <p className="text-[15px] font-extrabold text-bakery-ink">
            {formatDayTitle(checkInDateKey, locale)}
          </p>
        </div>

        <Input
          label={labels.rentalCheckOut}
          type="date"
          dir="ltr"
          min={minCheckout}
          value={checkOutDateKey}
          onChange={(e) => setCheckOutDateKey(e.target.value)}
          required
        />

        {periodPreview ? (
          <p className="rounded-2xl bg-bakery-primary/10 px-3 py-2 text-center text-[14px] font-extrabold text-bakery-ink">
            {labels.rentalPeriod}: {periodPreview}
          </p>
        ) : null}

        <CustomerServicePicker
          services={services}
          selectedId={serviceId}
          onSelect={setServiceId}
          labels={labels}
          locale={locale}
          storeTheme={storeTheme}
        />

        <Input
          label={labels.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label={labels.phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          dir="ltr"
          inputMode="tel"
          required
        />
        <Textarea
          label={labels.notes}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={
            submitting ||
            !slot ||
            !checkOutDateKey ||
            checkOutDateKey <= checkInDateKey ||
            name.trim().length < 2 ||
            !isValidPhone(phone.trim()) ||
            services.length === 0 ||
            serviceName.length < 1
          }
        >
          {submitting ? labels.bookingSubmitting : labels.confirmRentalBooking}
        </Button>
      </form>
    </CustomerCenterModal>
  );
}
