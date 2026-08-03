"use client";

import { useState } from "react";
import { Alert } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardModeToggle({
  enabled,
  onChange,
  previewOnly = false,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
  previewOnly?: boolean;
}) {
  const { labels } = useAppLocale();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSelect(next: boolean) {
    if (next === enabled || saving) return;
    setError("");
    onChange(next);

    if (previewOnly) return;

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/simple-mode", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? labels.saveError);
        onChange(!next);
      }
    } catch {
      setError(labels.networkError);
      onChange(!next);
    } finally {
      setSaving(false);
    }
  }

  const options = [
    { id: true, label: labels.simpleModeTitle },
    { id: false, label: labels.advancedModeTitle },
  ] as const;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        data-tour-id="tour-mode-switch"
        className={`mx-auto flex w-fit gap-2 rounded-[20px] border-[length:var(--dashboard-frame-border-width)] border-[color:var(--dashboard-frame-border)] bg-[var(--dashboard-panel-bg)] p-1.5 shadow-[0_8px_28px_var(--dashboard-shadow)] ${
          saving ? "opacity-45" : ""
        }`}
      >
        {options.map((opt) => (
          <button
            key={String(opt.id)}
            type="button"
            disabled={saving}
            aria-pressed={enabled === opt.id}
            onClick={() => handleSelect(opt.id)}
            className={`rounded-[15px] px-7 py-3 text-[16px] font-extrabold transition ${
              enabled === opt.id
                ? "bg-bakery-primary text-bakery-on-primary shadow-[var(--shadow-bakery-btn)]"
                : "text-bakery-ink hover:bg-bakery-cream-hover"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error ? <Alert variant="error">{error}</Alert> : null}
    </div>
  );
}
