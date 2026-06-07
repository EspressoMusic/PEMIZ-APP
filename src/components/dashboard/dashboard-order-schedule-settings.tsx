"use client";

import { useMemo, useState } from "react";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
import { Button, Alert, Toggle } from "@/components/ui";
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
}: {
  initialEnabled: boolean;
  initialScheduleJson: string | null;
  previewOnly?: boolean;
  mode?: "store" | "appointments";
}) {
  const initial = useMemo(
    () => parseOrderSchedule(initialScheduleJson, initialEnabled),
    [initialScheduleJson, initialEnabled]
  );

  const [enabled, setEnabled] = useState(initial.enabled);
  const [daySlots, setDaySlots] = useState<OrderDaySlot[]>(initial.daySlots);
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
  const pickDaysHint = isAppointments
    ? labels.workingDaysPickHint
    : labels.schedulePickDaysHint;

  function handleToggle(next: boolean) {
    setError("");
    setEnabled(next);
    if (next && daySlots.every((s) => !s.open)) {
      setDaySlots(defaultDaySlots());
    }
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

  async function save() {
    setError("");
    setMessage("");

    if (previewOnly) {
      setMessage(labels.previewSavedHint);
      setTimeout(() => setMessage(""), 3500);
      return;
    }

    const openSlots = daySlots.filter((s) => s.open);
    if (enabled && openSlots.length === 0) {
      setError(needOpenDayError);
      return;
    }

    if (enabled) {
      for (const slot of openSlots) {
        if (!normalizeTimeInput(slot.startTime) || !normalizeTimeInput(slot.endTime)) {
          setError(labels.scheduleInvalidHours);
          return;
        }
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
          enabled,
          daySlots: enabled ? normalized : defaultDaySlots(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? labels.saveError);
        return;
      }
      setMessage(labels.messageSent);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setError(labels.scheduleServerError);
    } finally {
      setSaving(false);
    }
  }

  const summary = formatOrderScheduleSummary(
    enabled,
    enabled ? orderScheduleToJson(daySlots) : null
  );

  return (
    <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3 text-center">
      <div className="mx-auto flex w-full max-w-[400px] flex-col items-center gap-4">
        <div className="dashboard-action-square flex w-full items-center justify-between gap-3 rounded-[22px] px-3 py-3.5 text-start">
          <span className="min-w-0 text-[15px] font-extrabold leading-snug text-bakery-ink">
            {toggleTitle}
          </span>
          <Toggle
            enabled={enabled}
            onChange={handleToggle}
            ariaLabel={toggleTitle}
          />
        </div>

        <DashboardHelpText>
          <p className="text-[13px] font-semibold text-bakery-muted">{summary}</p>
        </DashboardHelpText>

        {enabled && (
          <div className="w-full overflow-hidden rounded-[20px] border border-bakery-border/35 bg-bakery-card/70 p-3 shadow-[inset_0_1px_4px_rgba(58,47,38,0.06)]">
            <ul className="space-y-2">
              {daySlots.map((slot) => (
                <li
                  key={slot.day}
                  className={`overflow-hidden rounded-[16px] border border-bakery-border/30 bg-bakery-cream-light/80 px-2.5 py-2.5 transition ${
                    slot.open ? "" : "opacity-40"
                  }`}
                >
                  <div className="flex min-w-0 flex-col items-stretch gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDayOpen(slot.day)}
                      className={`w-full text-center text-[15px] font-extrabold transition ${
                        slot.open ? "text-bakery-ink" : "text-bakery-muted line-through"
                      }`}
                      title={dayToggleHint}
                    >
                      {dayNames[slot.day]}
                    </button>
                    <div
                      className="flex min-w-0 items-center justify-center gap-1.5"
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
                        className="bakery-field min-w-0 max-w-[42%] flex-1 rounded-[10px] border border-bakery-border/32 bg-bakery-input px-1.5 py-2 text-[13px] text-bakery-ink disabled:cursor-not-allowed disabled:opacity-50"
                      />
                      <span className="shrink-0 text-[13px] font-bold text-bakery-muted">
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
                        className="bakery-field min-w-0 max-w-[42%] flex-1 rounded-[10px] border border-bakery-border/32 bg-bakery-input px-1.5 py-2 text-[13px] text-bakery-ink disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {enabled && !previewOnly && (
          <DashboardHelpText>
            <p className="text-[12px] font-semibold text-bakery-muted">
              {pickDaysHint}
            </p>
          </DashboardHelpText>
        )}

        {error && <Alert variant="error">{error}</Alert>}
        {message && (
          <p className="w-full rounded-full border border-bakery-border/45 bg-bakery-input px-4 py-2.5 text-center text-[13px] font-bold text-bakery-ink">
            {message}
          </p>
        )}

        {enabled && (
          <Button
            type="button"
            variant="primary"
            className="w-full min-h-[44px] rounded-full font-extrabold"
            disabled={saving}
            onClick={save}
          >
            {saving ? labels.saving : saveLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
