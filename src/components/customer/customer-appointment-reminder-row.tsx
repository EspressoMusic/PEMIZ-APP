"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { Toggle } from "@/components/ui";
import type { CustomerLabels } from "./customer-labels";
import type { AppointmentSlot } from "./customer-appointment-calendar";
import {
  getCustomerDeviceItem,
  removeCustomerDeviceItem,
  setCustomerDeviceItem,
} from "@/lib/customer-device-storage";
import { requestAndSubscribePush } from "@/lib/push-client";

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
    <div className="block w-full rounded-[18px] border-[3px] border-[#6D4C41]/22 bg-[#E6D5B8] px-3 py-2.5 bakery-panel-shadow">
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
  const [pending, setPending] = useState(false);

  useEffect(() => {
    try {
      setEnabled(Boolean(getCustomerDeviceItem(reminderKey(businessSlug))));
    } catch {
      setEnabled(false);
    }
  }, [businessSlug]);

  if (!hasFullyBookedFutureDays(slots)) return null;

  async function setReminder(next: boolean) {
    if (pending) return;

    if (!next) {
      let stored: { endpoint?: string } = {};
      try {
        const raw = getCustomerDeviceItem(reminderKey(businessSlug));
        stored = raw ? (JSON.parse(raw) as { endpoint?: string }) : {};
      } catch {
        /* ignore */
      }
      try {
        removeCustomerDeviceItem(reminderKey(businessSlug));
      } catch {
        /* ignore */
      }
      setEnabled(false);
      if (stored.endpoint) {
        fetch(`/api/public/${businessSlug}/appointments/waitlist`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: stored.endpoint }),
        }).catch(() => undefined);
      }
      return;
    }

    const phone = customerPhone.trim();
    if (!phone) {
      onNeedPhone();
      return;
    }

    setPending(true);
    try {
      const outcome = await requestAndSubscribePush(
        `/api/public/${businessSlug}/push/config`,
        `/api/public/${businessSlug}/push/subscribe`
      );
      if (outcome.status !== "subscribed") return;

      const res = await fetch(`/api/public/${businessSlug}/appointments/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: outcome.endpoint, phone }),
      });
      if (!res.ok) return;

      setCustomerDeviceItem(
        reminderKey(businessSlug),
        JSON.stringify({
          phone,
          endpoint: outcome.endpoint,
          createdAt: new Date().toISOString(),
        })
      );
      setEnabled(true);
    } catch {
      /* ignore */
    } finally {
      setPending(false);
    }
  }

  return (
    <ReminderCard labels={labels} enabled={enabled} onToggle={setReminder} />
  );
}
