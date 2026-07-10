"use client";

import { useEffect, useMemo, useState, type MutableRefObject } from "react";
import { DASHBOARD_ACTION_ROW_CLASS } from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
import { DayScheduleEditor } from "@/components/dashboard/day-schedule-editor";
import { Button, Alert } from "@/components/ui";
import {
  defaultDaySlots,
  formatOrderScheduleSummary,
  getOrderDayFullNames,
  normalizeTimeInput,
  orderScheduleToJson,
  parseOrderSchedule,
  type OrderDaySlot,
} from "@/lib/order-schedule";
import {
  notifyOrderScheduleUpdated,
  writeDevWorkingDaysOverride,
} from "@/lib/order-schedule-sync";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardOrderScheduleSettings({
  initialEnabled,
  initialScheduleJson,
  previewOnly = false,
  mode = "store",
  inline = false,
  embeddedInSheet = false,
  nested = false,
  hideSaveButton = false,
  saveHandleRef,
  sectionLead = false,
  hideSectionTitle = false,
  welcomeSetup = false,
  basePath = "/dashboard",
}: {
  initialEnabled: boolean;
  initialScheduleJson: string | null;
  previewOnly?: boolean;
  mode?: "store" | "appointments";
  /** Show the day/time editor directly (welcome setup). */
  inline?: boolean;
  /** Editor only inside a parent action sheet (no duplicate title). */
  embeddedInSheet?: boolean;
  /** Render inside a parent card/section (no outer dashboard-card). */
  nested?: boolean;
  /** First block in a stacked form (no top divider). */
  sectionLead?: boolean;
  /** Hide the save button (parent saves programmatically). */
  hideSaveButton?: boolean;
  /** Optional ref for programmatic save (welcome setup). */
  saveHandleRef?: MutableRefObject<(() => Promise<boolean>) | null>;
  /** Hide the section title (welcome setup). */
  hideSectionTitle?: boolean;
  /** Flat rows without card backgrounds (welcome setup). */
  welcomeSetup?: boolean;
  basePath?: string;
}) {
  const initial = useMemo(
    () => parseOrderSchedule(initialScheduleJson, initialEnabled),
    [initialScheduleJson, initialEnabled]
  );

  const [enabled, setEnabled] = useState(initial.enabled);
  const [daySlots, setDaySlots] = useState<OrderDaySlot[]>(initial.daySlots);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { labels, locale } = useAppLocale();
  const dayNames = getOrderDayFullNames(locale);
  const isAppointments = mode === "appointments";
  const toggleTitle = isAppointments
    ? labels.workingDays
    : labels.orderScheduleLimitTitle;
  const saveLabel = isAppointments
    ? labels.saveWorkingDaysSettings
    : labels.saveOrderSettings;
  const dayToggleHint = isAppointments
    ? labels.workingDayToggleHint
    : labels.dayToggleHint;
  const needOpenDayError = isAppointments
    ? labels.workingDaysNeedOpenDay
    : labels.scheduleNeedOpenDay;

  useEffect(() => {
    if (!inline) return;
    if (initialEnabled || initialScheduleJson) return;
    setDaySlots(defaultDaySlots());
    setEnabled(true);
  }, [inline, initialEnabled, initialScheduleJson]);

  function openSheet() {
    setError("");
    if (!enabled && daySlots.every((s) => !s.open)) {
      setDaySlots(defaultDaySlots());
      setEnabled(true);
    }
    setSheetOpen(true);
  }

  function toggleDayOpen(day: number) {
    setDaySlots((prev) =>
      prev.map((s) => (s.day === day ? { ...s, open: !s.open } : s))
    );
  }

  function updateDayTime(
    day: number,
    field: "startTime" | "endTime",
    value: string
  ) {
    setDaySlots((prev) =>
      prev.map((s) => (s.day === day ? { ...s, [field]: value } : s))
    );
  }

  async function save(): Promise<boolean> {
    setError("");
    setMessage("");

    if (previewOnly) {
      const persistEnabled = isAppointments ? true : enabled;
      writeDevWorkingDaysOverride(
        basePath,
        persistEnabled,
        persistEnabled ? orderScheduleToJson(daySlots) : null
      );
      notifyOrderScheduleUpdated();
      setMessage(labels.previewSavedHint);
      setTimeout(() => setMessage(""), 3500);
      return true;
    }

    const openSlots = daySlots.filter((s) => s.open);
    if (openSlots.length === 0) {
      setError(needOpenDayError);
      return false;
    }

    for (const slot of openSlots) {
      if (!normalizeTimeInput(slot.startTime) || !normalizeTimeInput(slot.endTime)) {
        setError(labels.scheduleInvalidHours);
        return false;
      }
    }

    const normalized = daySlots.map((s) => ({
      ...s,
      startTime: normalizeTimeInput(s.startTime) ?? s.startTime,
      endTime: normalizeTimeInput(s.endTime) ?? s.endTime,
    }));

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/order-schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: true,
          daySlots: normalized,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? labels.saveError);
        return false;
      }
      setEnabled(true);
      setMessage(labels.messageSent);
      setTimeout(() => setMessage(""), 3000);
      setSheetOpen(false);
      notifyOrderScheduleUpdated();
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

  const summary = formatOrderScheduleSummary(
    enabled,
    enabled ? orderScheduleToJson(daySlots) : null
  );

  const dayEditor = (
    <div className="flex flex-col gap-2.5">
      <DayScheduleEditor
        daySlots={daySlots}
        dayNames={dayNames}
        onToggleDay={toggleDayOpen}
        onChangeTime={updateDayTime}
        dayToggleHint={dayToggleHint}
        fromHourLabel={labels.fromHour}
        toHourLabel={labels.toHour}
        welcomeSetup={welcomeSetup}
      />

      {error ? <Alert variant="error">{error}</Alert> : null}
      {message ? (
        <p className="rounded-full border border-bakery-border/45 bg-bakery-input px-3 py-2 text-center text-[12px] font-bold text-bakery-ink">
          {message}
        </p>
      ) : null}

      {!hideSaveButton ? (
        <Button
          type="button"
          variant="primary"
          className="w-full min-h-[42px] rounded-full font-extrabold"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? labels.saving : saveLabel}
        </Button>
      ) : null}
    </div>
  );

  const nestedToggle = (
    <>
      <button
        type="button"
        onClick={openSheet}
        aria-expanded={sheetOpen}
        className={`${DASHBOARD_ACTION_ROW_CLASS} justify-center${
          sheetOpen ? " bakery-float-tile--active" : ""
        }`}
      >
        <span className="text-[16px] font-extrabold leading-tight text-bakery-ink">
          {toggleTitle}
        </span>
      </button>

      <DashboardHelpText>
        <p className="text-[13px] font-semibold text-bakery-muted">{summary}</p>
      </DashboardHelpText>

      <DashboardActionSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={toggleTitle}
        ariaLabel={toggleTitle}
        placement="center"
        showBackButton
        compact
        fitContent
        panelClassName="dashboard-order-schedule-sheet"
      >
        {dayEditor}
      </DashboardActionSheet>
    </>
  );

  if (embeddedInSheet) {
    return dayEditor;
  }

  if (inline && nested) {
    return (
      <div
        className={`space-y-2 text-start${
          sectionLead ? "" : " border-t border-bakery-border/25 pt-4"
        }`}
      >
        {!hideSectionTitle ? (
          <p className="text-[15px] font-extrabold text-bakery-ink">{toggleTitle}</p>
        ) : null}
        {dayEditor}
      </div>
    );
  }

  if (inline) {
    return (
      <div className="space-y-2 text-start">
        {!hideSectionTitle ? (
          <p className="text-[15px] font-extrabold text-bakery-ink">{toggleTitle}</p>
        ) : null}
        {dayEditor}
      </div>
    );
  }

  if (nested) {
    return nestedToggle;
  }

  return (
    <>
      <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3 text-center">
        <div className="mx-auto flex w-full max-w-[400px] flex-col items-center gap-3">
          {nestedToggle}
        </div>
      </div>
    </>
  );
}
