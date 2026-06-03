"use client";

import { useMemo, useRef, useState } from "react";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
import { Button, Alert, Toggle } from "@/components/ui";
import {
  defaultOrderSchedule,
  formatOrderScheduleSummary,
  normalizeTimeInput,
  parseOrderSchedule,
} from "@/lib/order-schedule";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { getOrderDayLabels } from "@/lib/app-locale";

export function DashboardOrderScheduleSettings({
  initialEnabled,
  initialScheduleJson,
  previewOnly = false,
}: {
  initialEnabled: boolean;
  initialScheduleJson: string | null;
  previewOnly?: boolean;
}) {
  const initial = useMemo(
    () => parseOrderSchedule(initialScheduleJson, initialEnabled),
    [initialScheduleJson, initialEnabled]
  );

  const [enabled, setEnabled] = useState(initial.enabled);
  const [days, setDays] = useState<number[]>(initial.days);
  const [blockedDays, setBlockedDays] = useState<number[]>(initial.blockedDays);
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { labels, locale } = useAppLocale();
  const orderDayLabels = getOrderDayLabels(locale);
  const dayClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleToggle(next: boolean) {
    setError("");
    setEnabled(next);
    if (next && days.length === 0) {
      setDays(defaultOrderSchedule().days);
    }
  }

  function toggleDay(day: number) {
    if (blockedDays.includes(day)) return;
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function toggleBlockedDay(day: number) {
    setBlockedDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      }
      setDays((d) => d.filter((x) => x !== day));
      return [...prev, day].sort((a, b) => a - b);
    });
  }

  function handleDayClick(day: number) {
    if (dayClickTimerRef.current) clearTimeout(dayClickTimerRef.current);
    dayClickTimerRef.current = setTimeout(() => {
      dayClickTimerRef.current = null;
      toggleDay(day);
    }, 220);
  }

  function handleDayDoubleClick(day: number) {
    if (dayClickTimerRef.current) {
      clearTimeout(dayClickTimerRef.current);
      dayClickTimerRef.current = null;
    }
    toggleBlockedDay(day);
  }

  async function save() {
    setError("");
    setMessage("");

    if (previewOnly) {
      setMessage(labels.previewSavedHint);
      setTimeout(() => setMessage(""), 3500);
      return;
    }

    const openDays = days.filter((d) => !blockedDays.includes(d));
    if (enabled && openDays.length === 0) {
      setError(labels.scheduleNeedOpenDay);
      return;
    }

    const normStart = normalizeTimeInput(startTime);
    const normEnd = normalizeTimeInput(endTime);
    if (enabled && (!normStart || !normEnd)) {
      setError(labels.scheduleInvalidHours);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/order-schedule", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          days: enabled ? days : defaultOrderSchedule().days,
          blockedDays: enabled ? blockedDays : [],
          startTime: normStart ?? startTime,
          endTime: normEnd ?? endTime,
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
    enabled
      ? JSON.stringify({ days, blockedDays, startTime, endTime })
      : null
  );

  return (
    <div className="bakery-float-panel rounded-[24px] p-4 text-center">
      <div className="mx-auto flex w-full max-w-[360px] flex-col items-center gap-4">
        {previewOnly && (
          <Alert variant="info">
            {labels.scheduleDemoHint}
          </Alert>
        )}

        <DashboardHelpText>
          <p className="text-[13px] font-semibold text-bakery-muted">{summary}</p>
        </DashboardHelpText>

        <div className="flex w-full items-center justify-center gap-3">
          <DashboardHelpText>
            <span className="text-[14px] font-bold text-bakery-ink">
              {labels.enableOrderLimit}
            </span>
          </DashboardHelpText>
          <Toggle
            enabled={enabled}
            onChange={handleToggle}
            ariaLabel={labels.enableOrderLimit}
          />
        </div>

        {enabled && (
          <div className="w-full overflow-hidden rounded-[20px] border border-bakery-border/35 bg-bakery-card/70 p-4 shadow-[inset_0_1px_4px_rgba(58,47,38,0.06)]">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[14px] font-extrabold text-bakery-ink">
                  {labels.whichDays}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {orderDayLabels.map((label, day) => {
                    const blocked = blockedDays.includes(day);
                    const open = days.includes(day) && !blocked;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayClick(day)}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          handleDayDoubleClick(day);
                        }}
                        title={
                          blocked ? labels.dayClosedHint : labels.dayOpenHint
                        }
                        className={`min-w-[2.5rem] rounded-full px-3 py-1.5 text-[13px] font-bold transition ${
                          blocked
                            ? "bg-bakery-error text-white ring-2 ring-bakery-error/40"
                            : open
                              ? "bg-bakery-primary/15 text-bakery-primary ring-2 ring-bakery-primary/30"
                              : "border border-bakery-border/35 bg-bakery-input/80 text-bakery-ink"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[14px] font-extrabold text-bakery-ink">
                  {labels.whichHours}
                </p>
                <div className="grid w-full grid-cols-2 gap-3">
                  <label className="block space-y-1.5 text-center">
                    <span className="text-[14px] font-bold text-bakery-ink">
                      {labels.fromHour}
                    </span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bakery-field w-full rounded-2xl border-[1.5px] border-bakery-border/32 bg-bakery-input px-3 py-2.5 text-bakery-ink"
                      dir="ltr"
                    />
                  </label>
                  <label className="block space-y-1.5 text-center">
                    <span className="text-[14px] font-bold text-bakery-ink">
                      {labels.toHour}
                    </span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bakery-field w-full rounded-2xl border-[1.5px] border-bakery-border/32 bg-bakery-input px-3 py-2.5 text-bakery-ink"
                      dir="ltr"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {enabled && !previewOnly && (
          <DashboardHelpText>
            <p className="text-[12px] font-semibold text-bakery-muted">
              {labels.schedulePickDaysHint}
            </p>
          </DashboardHelpText>
        )}

        {error && <Alert variant="error">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        <Button
          type="button"
          variant="square"
          className="w-full"
          disabled={saving}
          onClick={save}
        >
          {saving ? labels.saving : labels.saveOrderSettings}
        </Button>
      </div>
    </div>
  );
}
