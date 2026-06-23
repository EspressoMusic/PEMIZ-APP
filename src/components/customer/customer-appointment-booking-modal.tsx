"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button, Input, Textarea } from "@/components/ui";
import {
  CustomerCenterModal,
  CustomerModalHeaderBar,
} from "@/components/customer/customer-center-modal";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import { isValidPhone } from "@/lib/phone";
import type { CustomerLabels } from "./customer-labels";
import type { AppointmentSlot } from "./customer-appointment-calendar";
import { CustomerServicePicker } from "./customer-service-picker";

function formatSlotTime(iso: string, locale: CustomerLocale) {
  return new Date(iso).toLocaleTimeString(locale === "he" ? "he-IL" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
type BookingStep = "time" | "details";

export function CustomerAppointmentBookingModal({
  open,
  onClose,
  dateKey,
  slots,
  services,
  locale,
  labels,
  storeTheme = "calm",
  initialName,
  initialPhone,
  submitting,
  error,
  onSubmit,
  bookingByDay = false,
}: {
  open: boolean;
  onClose: () => void;
  dateKey: string | null;
  slots: AppointmentSlot[];
  services: ServiceOption[];
  bookingByDay?: boolean;
  locale: CustomerLocale;
  labels: CustomerLabels;
  storeTheme?: StoreThemeId;
  initialName: string;
  initialPhone: string;
  submitting: boolean;
  error?: string;
  onSubmit: (payload: {
    slotId: string;
    name: string;
    phone: string;
    serviceName: string;
    notes: string;
  }) => void | Promise<void>;
}) {
  const [step, setStep] = useState<BookingStep>("time");
  const [slotId, setSlotId] = useState<string | null>(null);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [serviceId, setServiceId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    const openSlots = slots.filter(
      (s) =>
        s.appointments.length < s.maxBookings &&
        new Date(s.startAt) > new Date()
    );
    if (
      openSlots.length > 0 &&
      (bookingByDay || openSlots.length === 1)
    ) {
      setStep("details");
      setSlotId(openSlots[0].id);
    } else {
      setStep("time");
      setSlotId(null);
    }
    setName(initialName);
    setPhone(initialPhone);
    setServiceId(services[0]?.id ?? "");
    setNotes("");
  }, [open, initialName, initialPhone, slots, services, bookingByDay]);

  const selectedSlot = slots.find((s) => s.id === slotId) ?? null;
  const selectedService =
    services.find((s) => s.id === serviceId) ?? services[0] ?? null;
  const serviceName = selectedService?.name ?? "";

  function pickTime(id: string) {
    setSlotId(id);
    setStep("details");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slotId || serviceName.length < 1) return;
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (trimmedName.length < 2 || !isValidPhone(trimmedPhone)) return;
    void onSubmit({
      slotId,
      name: trimmedName,
      phone: trimmedPhone,
      serviceName,
      notes: notes.trim(),
    });
  }

  if (!dateKey) return null;

  const closeLabel = locale === "he" ? "סגור" : "Close";
  const modalTitle =
    step === "time" && !bookingByDay
      ? labels.calendarPickTime
      : labels.bookingTitle;

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
          title={modalTitle}
          onClose={onClose}
          closeLabel={closeLabel}
          leading={
            step === "details" && !bookingByDay ? (
              <button
                type="button"
                onClick={() => setStep("time")}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-[14px] font-bold text-bakery-ink transition hover:bg-bakery-card/80"
              >
                <ChevronLeft
                  className="h-5 w-5 rtl:rotate-180"
                  strokeWidth={2}
                />
                {labels.back}
              </button>
            ) : undefined
          }
        />
      }
    >
      {step === "time" ? (
        <div className="space-y-4">
          <p className="text-center text-[15px] font-extrabold leading-snug text-bakery-ink">
            {formatDayTitle(dateKey, locale)}
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {slots.map((slot) => {
              const spotsLeft = slot.maxBookings - slot.appointments.length;
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => pickTime(slot.id)}
                  className="min-w-[5.5rem] rounded-[10px] border-[2px] border-[#5C4A3E]/22 bg-bakery-card px-3 py-2.5 text-[15px] font-extrabold text-bakery-ink transition hover:border-bakery-primary hover:bg-bakery-cream-light active:scale-[0.98]"
                >
                  {formatSlotTime(slot.startAt, locale)}
                  <span className="mt-0.5 block text-[11px] font-semibold text-bakery-muted">
                    {spotsLeft} {labels.calendarSpotsLeft}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {selectedSlot ? (
            <div className="rounded-[14px] border border-bakery-border/35 bg-bakery-card px-4 py-3.5 text-center shadow-[0_2px_8px_rgba(58,47,38,0.08)]">
              <p className="text-[15px] font-extrabold leading-snug text-bakery-ink">
                {formatDayTitle(dateKey, locale)}
              </p>
              {!bookingByDay ? (
                <span
                  className="mt-2 block text-[26px] font-extrabold leading-none tabular-nums text-bakery-ink sm:text-[28px]"
                  dir="ltr"
                >
                  {formatSlotTime(selectedSlot.startAt, locale)}
                </span>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-2xl bg-bakery-error/10 px-3 py-2 text-center text-[13px] font-semibold text-bakery-error"
            >
              {error}
            </p>
          ) : null}

          <Input
            label={labels.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
          <Input
            label={labels.phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            className="text-start"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <CustomerServicePicker
            services={services}
            selectedId={serviceId}
            onSelect={setServiceId}
            labels={labels}
            locale={locale}
            storeTheme={storeTheme}
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
              !slotId ||
              services.length === 0 ||
              serviceName.length < 1 ||
              name.trim().length < 2 ||
              !isValidPhone(phone.trim())
            }
          >
            {submitting ? labels.bookingSubmitting : labels.confirmBooking}
          </Button>
        </form>
      )}
    </CustomerCenterModal>
  );
}
