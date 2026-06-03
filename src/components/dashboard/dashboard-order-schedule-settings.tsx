"use client";

import { useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { Button, Alert } from "@/components/ui";
import {
  ORDER_DAY_LABELS,
  defaultOrderSchedule,
  formatOrderScheduleSummary,
  normalizeTimeInput,
  parseOrderSchedule,
} from "@/lib/order-schedule";

function OrderLimitToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label="הגבל מתי לקוחות יכולים להזמין"
      onClick={() => onChange(!enabled)}
      className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        enabled ? "bg-bakery-primary" : "bg-bakery-border/45"
      }`}
      dir="ltr"
    >
      <span
        className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-[0_2px_6px_rgba(58,47,38,0.2)] transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}

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

  function handleToggle(next: boolean) {
    setError("");
    setEnabled(next);
    if (next && days.length === 0) {
      setDays(defaultOrderSchedule().days);
    }
  }

  function toggleDay(day: number) {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function save() {
    setError("");
    setMessage("");

    if (previewOnly) {
      setMessage("נשמר בתצוגה — בדשבורד האמיתי לחץ שמור לאחר ההתחברות");
      setTimeout(() => setMessage(""), 3500);
      return;
    }

    if (enabled && days.length === 0) {
      setError("יש לבחור לפחות יום אחד");
      return;
    }

    const normStart = normalizeTimeInput(startTime);
    const normEnd = normalizeTimeInput(endTime);
    if (enabled && (!normStart || !normEnd)) {
      setError("יש למלא שעות תקינות");
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
          startTime: normStart ?? startTime,
          endTime: normEnd ?? endTime,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? "שגיאה בשמירה");
        return;
      }
      setMessage("נשמר — ההגבלה פעילה ללקוחות");
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setError("לא הצלחנו להתחבר לשרת. נסה שוב.");
    } finally {
      setSaving(false);
    }
  }

  const summary = formatOrderScheduleSummary(
    enabled,
    enabled ? JSON.stringify({ days, startTime, endTime }) : null
  );

  return (
    <div className="bakery-float-panel rounded-[24px] p-4 text-center">
      <div className="mx-auto flex w-full max-w-[360px] flex-col items-center gap-4">
        {previewOnly && (
          <Alert variant="info">
            תצוגת דמו — המתג והבחירות עובדים. לשמירה אמיתית התחבר לדשבורד.
          </Alert>
        )}

        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-bakery-primary/12 text-bakery-primary">
          <Clock className="h-[20px] w-[20px]" strokeWidth={2.25} />
        </span>
        <div>
          <p className="text-[18px] font-extrabold text-bakery-ink">
            שעות וימי הזמנה
          </p>
          <p className="mt-1 text-[13px] font-semibold text-bakery-muted">
            {summary}
          </p>
        </div>

        <div className="flex w-full items-center justify-center gap-3">
          <span className="text-[14px] font-bold text-bakery-ink">
            הגבל מתי לקוחות יכולים להזמין
          </span>
          <OrderLimitToggle enabled={enabled} onChange={handleToggle} />
        </div>

        {enabled && (
          <div className="w-full overflow-hidden rounded-[20px] border border-bakery-border/35 bg-bakery-card/70 p-4 shadow-[inset_0_1px_4px_rgba(58,47,38,0.06)]">
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[14px] font-extrabold text-bakery-ink">
                  איזה ימים
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {ORDER_DAY_LABELS.map((label, day) => (
                    <button
                      key={day}
                      type="button"
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

              <div>
                <p className="mb-2 text-[14px] font-extrabold text-bakery-ink">
                  איזה שעות
                </p>
                <div className="grid w-full grid-cols-2 gap-3">
                  <label className="block space-y-1.5 text-center">
                    <span className="text-[14px] font-bold text-bakery-ink">
                      משעה
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
                      עד שעה
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
          <p className="text-[12px] font-semibold text-bakery-muted">
            בחר ימים ושעות, ואז לחץ שמור
          </p>
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
          {saving ? "שומר..." : "שמור הגדרות הזמנה"}
        </Button>
      </div>
    </div>
  );
}
