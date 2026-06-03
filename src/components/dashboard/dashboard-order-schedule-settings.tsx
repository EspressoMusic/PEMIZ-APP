"use client";

import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui";
import {
  ORDER_DAY_LABELS,
  defaultOrderSchedule,
  formatOrderScheduleSummary,
  parseOrderSchedule,
} from "@/lib/order-schedule";

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
  const [startTime, setStartTime] = useState(initial.startTime);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function toggleDay(day: number) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function save() {
    if (previewOnly) return;
    if (enabled && days.length === 0) {
      setError("יש לבחור לפחות יום אחד");
      return;
    }
    setError("");
    setSaving(true);
    const res = await fetch("/api/dashboard/order-schedule", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled,
        days: enabled ? days : defaultOrderSchedule().days,
        startTime,
        endTime,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError((d as { error?: string }).error ?? "שגיאה בשמירה");
      return;
    }
    setMessage("נשמר");
    setTimeout(() => setMessage(""), 2500);
  }

  return (
    <section className="overflow-hidden rounded-[22px] border-[1.2px] border-bakery-border/40 bg-bakery-square p-[18px] shadow-[var(--shadow-bakery-panel)]">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bakery-primary/12 text-bakery-primary">
          <Clock className="h-[18px] w-[18px]" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1 text-start">
          <p className="text-[15px] font-extrabold text-bakery-ink">
            שעות וימי הזמנה
          </p>
          <p className="text-[13px] text-bakery-muted">
            {formatOrderScheduleSummary(enabled, enabled ? JSON.stringify({ days, startTime, endTime }) : null)}
          </p>
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-end gap-2 text-[14px] font-bold text-bakery-ink">
        <span>הגבל מתי לקוחות יכולים להזמין</span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-4 w-4 shrink-0"
          disabled={previewOnly}
        />
      </label>

      {enabled && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-end text-[13px] font-bold text-bakery-muted">
              ימים פעילים
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              {ORDER_DAY_LABELS.map((label, day) => (
                <button
                  key={day}
                  type="button"
                  disabled={previewOnly}
                  onClick={() => toggleDay(day)}
                  className={`min-w-[2.5rem] rounded-full px-3 py-1.5 text-[13px] font-bold transition ${
                    days.includes(day)
                      ? "bg-bakery-primary/15 text-bakery-primary ring-2 ring-bakery-primary/30"
                      : "border border-bakery-border/35 bg-bakery-input/80 text-bakery-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5 text-end">
              <span className="text-[14px] font-bold text-bakery-ink">משעה</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={previewOnly}
                className="bakery-field w-full rounded-2xl border-[1.5px] border-bakery-border/32 bg-bakery-input px-3 py-2.5 text-bakery-ink"
                dir="ltr"
              />
            </label>
            <label className="block space-y-1.5 text-end">
              <span className="text-[14px] font-bold text-bakery-ink">עד שעה</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={previewOnly}
                className="bakery-field w-full rounded-2xl border-[1.5px] border-bakery-border/32 bg-bakery-input px-3 py-2.5 text-bakery-ink"
                dir="ltr"
              />
            </label>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-end text-[13px] font-semibold text-bakery-error">{error}</p>
      )}
      {message && (
        <p className="mt-3 text-end text-[13px] font-semibold text-bakery-success">
          {message}
        </p>
      )}

      {!previewOnly && (
        <Button
          type="button"
          variant="square"
          className="mt-4 w-full sm:w-auto sm:ms-auto sm:me-0 sm:block"
          disabled={saving}
          onClick={save}
        >
          {saving ? "שומר..." : "שמור הגדרות הזמנה"}
        </Button>
      )}
    </section>
  );
}
