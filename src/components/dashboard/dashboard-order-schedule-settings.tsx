"use client";

import { useEffect, useMemo, useState, type MutableRefObject } from "react";
import { DASHBOARD_ACTION_ROW_CLASS } from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
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
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardOrderScheduleSettings({
  initialEnabled,
  initialScheduleJson,
  previewOnly = false,
  mode = "store",
  inline = false,
  nested = false,
  hideSaveButton = false,
  saveHandleRef,
}: {
  initialEnabled: boolean;
  initialScheduleJson: string | null;
  previewOnly?: boolean;
  mode?: "store" | "appointments";
  /** Show the day/time editor directly (welcome setup). */
  inline?: boolean;
  /** Render inside a parent card/section (no outer dashboard-card). */
  nested?: boolean;
  /** Hide the save button (parent saves programmatically). */
  hideSaveButton?: boolean;
  /** Optional ref for programmatic save (welcome setup). */
  saveHandleRef?: MutableRefObject<(() => Promise<boolean>) | null>;
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
      <ul className="space-y-1">
        {daySlots.map((slot) => (
          <li
            key={slot.day}
            className={`flex items-center gap-2 rounded-[14px] border border-bakery-border/30 bg-bakery-cream-light/80 px-2 py-1.5 transition ${
              slot.open ? "" : "opacity-40"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleDayOpen(slot.day)}
              className={`w-[5.25rem] shrink-0 truncate text-start text-[13px] font-extrabold leading-tight transition ${
                slot.open ? "text-bakery-ink" : "text-bakery-muted line-through"
              }`}
              title={dayToggleHint}
            >
              {dayNames[slot.day]}
            </button>
            <div
              className="flex min-w-0 flex-1 items-center justify-end gap-1"
              dir="ltr"
            >
              <input
                type="time"
                value={slot.startTime}
                disabled={!slot.open}
                onChange={(e) =>
                  updateDayTime(slot.day, "startTime", e.target.value)
                }
                aria-label={`${dayNames[slot.day]} ${labels.fromHour}`}
                className="bakery-field min-w-0 flex-1 rounded-[8px] border border-bakery-border/32 bg-bakery-input px-1 py-1 text-[12px] text-bakery-ink disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="shrink-0 text-[11px] font-bold text-bakery-muted">
                –
              </span>
              <input
                type="time"
                value={slot.endTime}
                disabled={!slot.open}
                onChange={(e) =>
                  updateDayTime(slot.day, "endTime", e.target.value)
                }
                aria-label={`${dayNames[slot.day]} ${labels.toHour}`}
                className="bakery-field min-w-0 flex-1 rounded-[8px] border border-bakery-border/32 bg-bakery-input px-1 py-1 text-[12px] text-bakery-ink disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </li>
        ))}
      </ul>

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

  if (inline && nested) {
    return (
      <div className="space-y-2 border-t border-bakery-border/25 pt-4 text-start">
        <p className="text-[15px] font-extrabold text-bakery-ink">{toggleTitle}</p>
        <p className="text-[12px] font-semibold text-bakery-muted">
          {labels.workingDaysPickHint}
        </p>
        {dayEditor}
      </div>
    );
  }

  if (inline) {
    return (
      <div className="space-y-2 text-start">
        <p className="text-[15px] font-extrabold text-bakery-ink">{toggleTitle}</p>
        <p className="text-[12px] font-semibold text-bakery-muted">
          {labels.workingDaysPickHint}
        </p>
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
