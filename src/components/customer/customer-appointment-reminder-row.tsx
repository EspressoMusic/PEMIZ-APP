"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Toggle } from "@/components/ui";
import type { CustomerLabels } from "./customer-labels";
import type { AppointmentSlot } from "./customer-appointment-calendar";

function localDateKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function slotIsOpen(slot: AppointmentSlot) {
  return (
    slot.appointments.length < slot.maxBookings &&
    new Date(slot.startAt) > new Date()
  );
}

export function hasFullyBookedFutureDays(slots: AppointmentSlot[]) {
  const todayKey = localDateKey(new Date().toISOString());
  const slotsByDay = new Map<string, AppointmentSlot[]>();

  for (const slot of slots) {
    const key = localDateKey(slot.startAt);
    const list = slotsByDay.get(key) ?? [];
    list.push(slot);
    slotsByDay.set(key, list);
  }

  for (const [dateKey, daySlots] of slotsByDay) {
    if (dateKey < todayKey) continue;
    const futureSlots = daySlots.filter((s) => new Date(s.startAt) > new Date());
    if (futureSlots.length === 0) continue;
    if (!futureSlots.some(slotIsOpen)) return true;
  }

  return false;
}

function reminderKey(slug: string) {
  return `linky-appt-reminder-${slug}`;
}

function ReminderCard({
  labels,
  enabled,
  onToggle,
}: {
  labels: CustomerLabels;
  enabled: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <div className="block w-full rounded-[18px] border-[3px] border-[#5C4A3E]/22 bg-[#E6D5B8] bakery-panel-shadow">
      <div className="m-2">
        <div className="rounded-[12px] bg-bakery-card px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-bakery-border/35 bg-bakery-square shadow-[0_2px_6px_rgba(58,47,38,0.08)]">
              <BellRing
                className="h-[18px] w-[18px] text-bakery-ink"
                strokeWidth={1.75}
              />
            </span>
            <div className="min-w-0 flex-1 text-start">
              <p className="text-[13px] font-extrabold leading-tight text-bakery-ink">
                {labels.appointmentReminderTitle}
              </p>
            </div>
            <div className="shrink-0 origin-center scale-[0.88]">
              <Toggle
                enabled={enabled}
                onChange={onToggle}
                ariaLabel={labels.appointmentReminderTitle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomerAppointmentReminderRow({
  businessSlug,
  slots,
  labels,
  customerPhone,
  onNeedPhone,
}: {
  businessSlug: string;
  slots: AppointmentSlot[];
  labels: CustomerLabels;
  customerPhone: string;
  onNeedPhone: () => void;
}) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      setEnabled(Boolean(localStorage.getItem(reminderKey(businessSlug))));
    } catch {
      setEnabled(false);
    }
  }, [businessSlug]);

  if (!hasFullyBookedFutureDays(slots)) return null;

  function setReminder(next: boolean) {
    if (!next) {
      try {
        localStorage.removeItem(reminderKey(businessSlug));
      } catch {
        /* ignore */
      }
      setEnabled(false);
      return;
    }

    const phone = customerPhone.trim();
    if (!phone) {
      onNeedPhone();
      return;
    }

    try {
      localStorage.setItem(
        reminderKey(businessSlug),
        JSON.stringify({ phone, createdAt: new Date().toISOString() })
      );
      setEnabled(true);
    } catch {
      /* ignore */
    }
  }

  return (
    <ReminderCard labels={labels} enabled={enabled} onToggle={setReminder} />
  );
}
