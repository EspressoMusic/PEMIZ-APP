"use client";

import { useState } from "react";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
import { Button, Alert, Toggle } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardAppointmentBookingByDaySettings({
  initialBookingByDay = false,
  previewOnly = false,
}: {
  initialBookingByDay?: boolean;
  previewOnly?: boolean;
}) {
  const { labels } = useAppLocale();
  const [bookingByDay, setBookingByDay] = useState(initialBookingByDay);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleToggle(next: boolean) {
    setError("");
    setBookingByDay(next);
  }

  async function save() {
    setError("");
    setMessage("");

    if (previewOnly) {
      setMessage(labels.previewSavedHint);
      setTimeout(() => setMessage(""), 3500);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/appointment-calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingByDay, regenerate: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? labels.saveError);
        return;
      }
      setMessage(labels.appointmentCalendarUpdated);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setError(labels.scheduleServerError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-card bakery-float-panel mt-auto shrink-0 rounded-[32px] p-3 text-center">
      <div className="mx-auto flex w-full max-w-[400px] flex-col items-center gap-4">
        <div className="dashboard-action-square flex w-full items-center justify-between gap-3 rounded-[22px] px-3 py-3.5 text-start">
          <span className="min-w-0 text-[15px] font-extrabold leading-snug text-bakery-ink">
            {labels.appointmentBookingByDay}
          </span>
          <Toggle
            enabled={bookingByDay}
            onChange={handleToggle}
            ariaLabel={labels.appointmentBookingByDay}
          />
        </div>

        <DashboardHelpText>
          <p className="text-[12px] font-semibold text-bakery-muted">
            {labels.appointmentBookingByDayHint}
          </p>
        </DashboardHelpText>

        {error && <Alert variant="error">{error}</Alert>}
        {message && (
          <p className="w-full rounded-full border border-bakery-border/45 bg-bakery-input px-4 py-2.5 text-center text-[13px] font-bold text-bakery-ink">
            {message}
          </p>
        )}

        <Button
          type="button"
          variant="primary"
          className="w-full min-h-[44px] rounded-full font-extrabold"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? labels.saving : labels.saveAppointmentCalendar}
        </Button>
      </div>
    </div>
  );
}
