"use client";

import { useMemo, useState } from "react";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
import { Button, Alert, Toggle } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  buildAppointmentCancelStoreTerms,
  formatAppointmentCancelSummary,
  parseAppointmentCancelPolicy,
  type AppointmentCancelPolicy,
  type AppointmentCancelUnit,
} from "@/lib/appointment-cancel-policy";

function clampAmount(unit: AppointmentCancelUnit, value: number) {
  const n = Math.round(value);
  if (unit === "days") return Math.min(30, Math.max(1, n));
  return Math.min(168, Math.max(1, n));
}

export function DashboardAppointmentCancelSettings({
  initialStoreTerms,
  previewOnly = false,
}: {
  initialStoreTerms: string | null;
  previewOnly?: boolean;
}) {
  const initial = useMemo(
    () => parseAppointmentCancelPolicy(initialStoreTerms),
    [initialStoreTerms]
  );

  const [enabled, setEnabled] = useState(initial.enabled);
  const [unit, setUnit] = useState<AppointmentCancelUnit>(initial.unit);
  const [amount, setAmount] = useState(initial.amount);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { labels, locale } = useAppLocale();

  const policy: AppointmentCancelPolicy = {
    enabled,
    unit,
    amount: clampAmount(unit, amount),
  };

  const summary = formatAppointmentCancelSummary(policy, locale);

  function handleToggle(next: boolean) {
    setError("");
    setEnabled(next);
  }

  function selectUnit(next: AppointmentCancelUnit) {
    setUnit(next);
    setAmount((prev) => clampAmount(next, prev));
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
      const res = await fetch("/api/dashboard/store-legal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeTerms: buildAppointmentCancelStoreTerms(policy, locale),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? labels.saveError);
        return;
      }
      setMessage(labels.appointmentCancelSaved);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setError(labels.scheduleServerError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3 text-center">
      <div className="mx-auto flex w-full max-w-[400px] flex-col items-center gap-4">
        <div className="dashboard-action-square flex w-full items-center justify-between gap-3 rounded-[22px] px-3 py-3.5 text-start">
          <span className="min-w-0 text-[15px] font-extrabold leading-snug text-bakery-ink">
            {labels.appointmentCancelLimitTitle}
          </span>
          <Toggle
            enabled={enabled}
            onChange={handleToggle}
            ariaLabel={labels.appointmentCancelLimitTitle}
          />
        </div>

        <DashboardHelpText>
          <p className="text-[13px] font-semibold text-bakery-muted">{summary}</p>
        </DashboardHelpText>

        {enabled && (
          <div className="w-full space-y-3 overflow-hidden rounded-[20px] border border-bakery-border/35 bg-bakery-card/70 p-3 shadow-[inset_0_1px_4px_rgba(58,47,38,0.06)]">
            <p className="text-center text-[13px] font-bold text-bakery-muted">
              {labels.appointmentCancelUnitLabel}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["hours", "days"] as const).map((option) => {
                const active = unit === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectUnit(option)}
                    className={`min-h-[44px] rounded-[14px] border-[2px] px-3 py-2.5 text-[14px] font-extrabold transition active:scale-[0.98] ${
                      active
                        ? "border-bakery-primary bg-bakery-primary text-bakery-on-primary"
                        : "border-bakery-border/35 bg-bakery-cream-light text-bakery-ink hover:bg-bakery-card"
                    }`}
                  >
                    {option === "hours"
                      ? labels.appointmentCancelByHours
                      : labels.appointmentCancelByDays}
                  </button>
                );
              })}
            </div>

            <label className="block space-y-1.5 text-start">
              <span className="block text-[14px] font-bold text-bakery-ink">
                {unit === "hours"
                  ? labels.appointmentCancelHoursBefore
                  : labels.appointmentCancelDaysBefore}
              </span>
              <input
                type="number"
                min={1}
                max={unit === "days" ? 30 : 168}
                value={amount}
                onChange={(e) =>
                  setAmount(clampAmount(unit, Number(e.target.value) || 1))
                }
                className="bakery-field w-full rounded-[12px] border border-bakery-border/32 bg-bakery-input px-4 py-3 text-center text-[18px] font-extrabold text-bakery-ink"
              />
            </label>
          </div>
        )}

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
          onClick={save}
        >
          {saving ? labels.saving : labels.saveAppointmentCancelSettings}
        </Button>
      </div>
    </div>
  );
}
