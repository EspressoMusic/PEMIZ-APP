"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DASHBOARD_ACTION_ROW_CLASS } from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
import { Button, Alert, Input } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  clampAppointmentCalendarConfig,
  DEFAULT_APPOINTMENT_CALENDAR,
  type AppointmentCalendarConfig,
} from "@/lib/appointment-slot-generator";

function formatCalendarSummary(
  config: AppointmentCalendarConfig,
  locale: "he" | "en"
): string {
  const range = `${config.bookingStart}–${config.bookingEnd}`;
  if (locale === "he") {
    if (config.bookingByDay) {
      return `${range} · הזמנה לפי ימים`;
    }
    return `${range} · רווח ${config.gapMinutes} דק׳ · משך ${config.durationMinutes} דק׳`;
  }
  if (config.bookingByDay) {
    return `${range} · book by day`;
  }
  return `${range} · ${config.gapMinutes} min gap · ${config.durationMinutes} min slots`;
}

export function DashboardAppointmentsCalendarSettings({
  previewOnly = false,
  initialConfig = DEFAULT_APPOINTMENT_CALENDAR,
}: {
  previewOnly?: boolean;
  initialConfig?: AppointmentCalendarConfig;
}) {
  const { labels, locale } = useAppLocale();
  const [gapMinutes, setGapMinutes] = useState(initialConfig.gapMinutes);
  const [durationMinutes, setDurationMinutes] = useState(
    initialConfig.durationMinutes
  );
  const [bookingStart, setBookingStart] = useState(initialConfig.bookingStart);
  const [bookingEnd, setBookingEnd] = useState(initialConfig.bookingEnd);
  const [bookingByDay, setBookingByDay] = useState(
    initialConfig.bookingByDay ?? false
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const title = labels.appointmentBookingHours;

  const config = useMemo(
    () =>
      clampAppointmentCalendarConfig({
        gapMinutes,
        durationMinutes,
        bookingStart,
        bookingEnd,
        bookingByDay,
      }),
    [gapMinutes, durationMinutes, bookingStart, bookingEnd, bookingByDay]
  );

  const summary = formatCalendarSummary(config, locale);

  const load = useCallback(async () => {
    if (previewOnly) return;
    const res = await fetch("/api/dashboard/appointment-calendar");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;
    const payload = data as { config?: AppointmentCalendarConfig };
    if (payload.config) {
      setGapMinutes(payload.config.gapMinutes);
      setDurationMinutes(payload.config.durationMinutes);
      setBookingStart(payload.config.bookingStart);
      setBookingEnd(payload.config.bookingEnd);
      setBookingByDay(payload.config.bookingByDay ?? false);
    }
  }, [previewOnly]);

  useEffect(() => {
    if (previewOnly) return;
    void load();
  }, [previewOnly, load]);

  async function save() {
    setError("");
    setMessage("");

    const startM =
      Number(config.bookingStart.split(":")[0]) * 60 +
      Number(config.bookingStart.split(":")[1]);
    const endM =
      Number(config.bookingEnd.split(":")[0]) * 60 +
      Number(config.bookingEnd.split(":")[1]);
    if (endM <= startM) {
      setError(labels.scheduleInvalidHours);
      return;
    }

    if (previewOnly) {
      setMessage(labels.previewSavedHint);
      setTimeout(() => setMessage(""), 3500);
      setSheetOpen(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/appointment-calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, regenerate: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? labels.saveError);
        return;
      }
      const payload = data as { config?: AppointmentCalendarConfig };
      if (payload.config) {
        setGapMinutes(payload.config.gapMinutes);
        setDurationMinutes(payload.config.durationMinutes);
        setBookingStart(payload.config.bookingStart);
        setBookingEnd(payload.config.bookingEnd);
      }
      setMessage(labels.appointmentCalendarSaved);
      setTimeout(() => setMessage(""), 3000);
      setSheetOpen(false);
    } catch {
      setError(labels.scheduleServerError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3 text-center">
        <div className="mx-auto flex w-full max-w-[400px] flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-expanded={sheetOpen}
            className={`${DASHBOARD_ACTION_ROW_CLASS} justify-center${
              sheetOpen ? " bakery-float-tile--active" : ""
            }`}
          >
            <span className="text-[16px] font-extrabold leading-tight text-bakery-ink">
              {title}
            </span>
          </button>

          <DashboardHelpText>
            <p className="text-[13px] font-semibold text-bakery-muted">{summary}</p>
          </DashboardHelpText>
        </div>
      </div>

      <DashboardActionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={title}
        ariaLabel={title}
        placement="center"
        showBackButton
        compact
        panelClassName="dashboard-appointments-calendar-sheet"
      >
        <div className="flex w-full flex-col items-center gap-4">
          <div className="w-full space-y-3 text-start">
            <div className="space-y-3">
              <Input
                label={labels.appointmentBookingFrom}
                type="time"
                value={bookingStart}
                onChange={(e) => setBookingStart(e.target.value)}
                dir="ltr"
              />
              <Input
                label={labels.appointmentBookingUntil}
                type="time"
                value={bookingEnd}
                onChange={(e) => setBookingEnd(e.target.value)}
                dir="ltr"
              />
            </div>

            <Input
              label={labels.appointmentGapMinutes}
              type="number"
              min={0}
              max={180}
              value={gapMinutes}
              onChange={(e) => setGapMinutes(Number(e.target.value) || 0)}
              dir="ltr"
            />

            {!bookingByDay ? (
              <Input
                label={labels.appointmentDurationMinutes}
                type="number"
                min={15}
                max={240}
                step={15}
                value={durationMinutes}
                onChange={(e) =>
                  setDurationMinutes(Number(e.target.value) || 60)
                }
                dir="ltr"
              />
            ) : null}
          </div>

          <DashboardHelpText>
            <p className="text-[12px] font-semibold text-bakery-muted">
              {locale === "he"
                ? "לאחר שמירה היומן מתעדכן אוטומטית לפי ימי העבודה, השעות והרווח."
                : "After saving, the calendar updates automatically from working days, hours, and gap."}
            </p>
          </DashboardHelpText>

          {error ? <Alert variant="error">{error}</Alert> : null}
          {message ? (
            <p className="w-full rounded-full border border-bakery-border/45 bg-bakery-input px-4 py-2.5 text-center text-[13px] font-bold text-bakery-ink">
              {message}
            </p>
          ) : null}

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
      </DashboardActionSheet>
    </>
  );
}
