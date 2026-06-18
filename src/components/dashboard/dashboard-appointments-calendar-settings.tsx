"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DASHBOARD_ACTION_ROW_CLASS } from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
import { DashboardOrderScheduleSettings } from "@/components/dashboard/dashboard-order-schedule-settings";
import { Button, Alert, Input, Toggle } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  clampAppointmentCalendarConfig,
  DEFAULT_APPOINTMENT_CALENDAR,
  type AppointmentCalendarConfig,
} from "@/lib/appointment-slot-generator";
import {
  formatOrderScheduleSummary,
  parseOrderSchedule,
} from "@/lib/order-schedule";

function formatCalendarSummary(
  config: AppointmentCalendarConfig,
  locale: "he" | "en"
): string {
  const range = `${config.bookingStart}–${config.bookingEnd}`;
  if (locale === "he") {
    if (config.bookingByDay) {
      return `${range} · הזמנה לפי ימים`;
    }
    const gap =
      config.gapMinutes > 0 ? ` · רווח ${config.gapMinutes} דק׳` : "";
    return `${range} · משך ${config.durationMinutes} דק׳${gap}`;
  }
  if (config.bookingByDay) {
    return `${range} · book by day`;
  }
  const gap =
    config.gapMinutes > 0 ? ` · ${config.gapMinutes} min gap` : "";
  return `${range} · ${config.durationMinutes} min slots${gap}`;
}

type CalendarSettingsProps = {
  previewOnly?: boolean;
  initialConfig?: AppointmentCalendarConfig;
  inline?: boolean;
  saveHandleRef?: MutableRefObject<(() => Promise<boolean>) | null>;
  workingDays?: {
    initialEnabled: boolean;
    initialScheduleJson: string | null;
    previewOnly?: boolean;
  };
  scheduleSaveHandleRef?: MutableRefObject<(() => Promise<boolean>) | null>;
  basePath?: string;
  openedFromActionsHub?: boolean;
  openHoursFromQuery?: boolean;
};

export function DashboardAppointmentsCalendarSettings(
  props: CalendarSettingsProps
) {
  if (props.inline) {
    return (
      <DashboardAppointmentsCalendarSettingsCore
        {...props}
        openedFromActionsHub={false}
        openHoursFromQuery={false}
      />
    );
  }

  return (
    <Suspense fallback={null}>
      <DashboardAppointmentsCalendarSettingsWithQuery {...props} />
    </Suspense>
  );
}

function DashboardAppointmentsCalendarSettingsWithQuery(
  props: CalendarSettingsProps
) {
  const searchParams = useSearchParams();
  const openHours = searchParams.get("open") === "hours";
  return (
    <DashboardAppointmentsCalendarSettingsCore
      {...props}
      openedFromActionsHub={openHours}
      openHoursFromQuery={openHours}
    />
  );
}

function DashboardAppointmentsCalendarSettingsCore({
  previewOnly = false,
  initialConfig = DEFAULT_APPOINTMENT_CALENDAR,
  inline = false,
  saveHandleRef,
  workingDays,
  scheduleSaveHandleRef,
  basePath = "/dashboard",
  openedFromActionsHub = false,
  openHoursFromQuery = false,
}: CalendarSettingsProps & {
  openedFromActionsHub: boolean;
  openHoursFromQuery: boolean;
}) {
  const { labels, locale } = useAppLocale();
  const router = useRouter();
  const [gapMinutes, setGapMinutes] = useState(initialConfig.gapMinutes);
  const [gapEnabled, setGapEnabled] = useState(initialConfig.gapMinutes > 0);
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
  const internalScheduleSaveRef = useRef<(() => Promise<boolean>) | null>(null);
  const resolvedScheduleSaveRef = scheduleSaveHandleRef ?? internalScheduleSaveRef;
  const parentOrchestratesSaves = Boolean(
    saveHandleRef && scheduleSaveHandleRef
  );

  const effectiveGapMinutes = gapEnabled ? gapMinutes : 0;
  const effectiveBookingStart = workingDays ? "00:00" : bookingStart;
  const effectiveBookingEnd = workingDays ? "23:59" : bookingEnd;

  const config = useMemo(
    () =>
      clampAppointmentCalendarConfig({
        gapMinutes: effectiveGapMinutes,
        durationMinutes,
        bookingStart: effectiveBookingStart,
        bookingEnd: effectiveBookingEnd,
        bookingByDay,
      }),
    [
      effectiveGapMinutes,
      durationMinutes,
      effectiveBookingStart,
      effectiveBookingEnd,
      bookingByDay,
    ]
  );

  const summary = formatCalendarSummary(config, locale);

  const workingDaysSummary = useMemo(() => {
    if (!workingDays) return null;
    const parsed = parseOrderSchedule(
      workingDays.initialScheduleJson,
      workingDays.initialEnabled
    );
    return formatOrderScheduleSummary(parsed.enabled, parsed.enabled ? workingDays.initialScheduleJson : null);
  }, [workingDays]);

  const load = useCallback(async () => {
    if (previewOnly) return;
    const res = await fetch("/api/dashboard/appointment-calendar");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return;
    const payload = data as { config?: AppointmentCalendarConfig };
    if (payload.config) {
      setGapMinutes(payload.config.gapMinutes);
      setGapEnabled(payload.config.gapMinutes > 0);
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

  useEffect(() => {
    if (openHoursFromQuery) {
      setSheetOpen(true);
    }
  }, [openHoursFromQuery]);

  function closeSheet() {
    setSheetOpen(false);
    if (openedFromActionsHub) {
      router.replace(`${basePath}/actions`);
    }
  }

  async function save(): Promise<boolean> {
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
      return false;
    }

    if (previewOnly) {
      if (
        workingDays &&
        !parentOrchestratesSaves &&
        resolvedScheduleSaveRef.current
      ) {
        const scheduleOk = await resolvedScheduleSaveRef.current();
        if (!scheduleOk) return false;
      }
      setMessage(labels.previewSavedHint);
      setTimeout(() => setMessage(""), 3500);
      closeSheet();
      return true;
    }

    setSaving(true);
    try {
      if (
        workingDays &&
        !parentOrchestratesSaves &&
        resolvedScheduleSaveRef.current
      ) {
        const scheduleOk = await resolvedScheduleSaveRef.current();
        if (!scheduleOk) {
          return false;
        }
      }

      const res = await fetch("/api/dashboard/appointment-calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, regenerate: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? labels.saveError);
        return false;
      }
      const payload = data as { config?: AppointmentCalendarConfig };
      if (payload.config) {
        setGapMinutes(payload.config.gapMinutes);
        setGapEnabled(payload.config.gapMinutes > 0);
        setDurationMinutes(payload.config.durationMinutes);
        setBookingStart(payload.config.bookingStart);
        setBookingEnd(payload.config.bookingEnd);
      }
      setMessage(labels.appointmentCalendarSaved);
      setTimeout(() => setMessage(""), 3000);
      closeSheet();
      return true;
    } catch {
      setError(labels.scheduleServerError);
      return false;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!saveHandleRef) return;
    saveHandleRef.current = save;
    return () => {
      saveHandleRef.current = null;
    };
  });

  function handleGapToggle(next: boolean) {
    setGapEnabled(next);
    if (next && gapMinutes === 0) {
      setGapMinutes(15);
    }
  }

  const workingDaysEditor = workingDays ? (
    <DashboardOrderScheduleSettings
      mode="appointments"
      initialEnabled={workingDays.initialEnabled}
      initialScheduleJson={workingDays.initialScheduleJson}
      previewOnly={workingDays.previewOnly ?? previewOnly}
      nested
      inline
      sectionLead
      hideSaveButton
      saveHandleRef={resolvedScheduleSaveRef}
      basePath={basePath}
    />
  ) : null;

  const calendarSettingsForm = (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="w-full space-y-4 text-start">
        {workingDaysEditor}

        {!bookingByDay ? (
          <div className="overflow-hidden rounded-[20px] border border-bakery-border/35 bg-bakery-card/70 p-3 shadow-[inset_0_1px_4px_rgba(58,47,38,0.06)]">
            <Input
              label={labels.appointmentDurationMinutes}
              type="number"
              min={15}
              max={240}
              step={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value) || 60)}
              dir="ltr"
            />
          </div>
        ) : null}

        {!bookingByDay ? (
          <div className="space-y-3">
            <div className="dashboard-action-square flex w-full items-center justify-between gap-3 rounded-[22px] px-3 py-3.5 text-start">
              <span className="min-w-0 text-[15px] font-extrabold leading-snug text-bakery-ink">
                {labels.appointmentGapBetweenMeetings}
              </span>
              <Toggle
                enabled={gapEnabled}
                onChange={handleGapToggle}
                ariaLabel={labels.appointmentGapBetweenMeetings}
              />
            </div>
            {gapEnabled ? (
              <div className="overflow-hidden rounded-[20px] border border-bakery-border/35 bg-bakery-card/70 p-3 shadow-[inset_0_1px_4px_rgba(58,47,38,0.06)]">
                <Input
                  label={labels.appointmentGapMinutes}
                  type="number"
                  min={0}
                  max={180}
                  value={gapMinutes}
                  onChange={(e) => setGapMinutes(Number(e.target.value) || 0)}
                  dir="ltr"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {!workingDays ? (
          <div className="space-y-3 border-t border-bakery-border/25 pt-4">
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
        ) : null}
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? (
        <p className="w-full rounded-full border border-bakery-border/45 bg-bakery-input px-4 py-2.5 text-center text-[13px] font-bold text-bakery-ink">
          {message}
        </p>
      ) : null}

      {!saveHandleRef ? (
        <Button
          type="button"
          variant="primary"
          className="w-full min-h-[44px] rounded-full font-extrabold"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? labels.saving : labels.saveAppointmentCalendar}
        </Button>
      ) : null}
    </div>
  );

  if (inline) {
    return <div className="space-y-2 text-start">{calendarSettingsForm}</div>;
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
            {workingDaysSummary ? (
              <p className="mt-1 text-[13px] font-semibold text-bakery-muted">
                {workingDaysSummary}
              </p>
            ) : null}
          </DashboardHelpText>
        </div>
      </div>

      <DashboardActionSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={title}
        ariaLabel={title}
        placement="center"
        showBackButton
        compact
        panelClassName="dashboard-appointments-calendar-sheet"
      >
        {calendarSettingsForm}
      </DashboardActionSheet>
    </>
  );
}
