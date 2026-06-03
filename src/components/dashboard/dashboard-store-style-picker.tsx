"use client";

import { useState } from "react";
import { ChevronLeft, Palette, Languages } from "lucide-react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import {
  STORE_THEMES,
  parseStoreTheme,
  type StoreThemeId,
} from "@/lib/store-themes";

export function DashboardStoreStylePicker({
  initialTheme,
  initialLocale = "he",
  previewOnly = false,
}: {
  initialTheme: StoreThemeId;
  initialLocale?: CustomerLocale;
  previewOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<StoreThemeId>(parseStoreTheme(initialTheme));
  const [locale, setLocale] = useState<CustomerLocale>(
    initialLocale === "en" ? "en" : "he"
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveAppearance(patch: {
    storeTheme?: StoreThemeId;
    storeLocale?: CustomerLocale;
  }) {
    if (patch.storeTheme != null) setTheme(patch.storeTheme);
    if (patch.storeLocale != null) setLocale(patch.storeLocale);
    if (previewOnly) return;

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/dashboard/store-theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setMessage((d as { error?: string }).error ?? "שגיאה בשמירה");
        return;
      }
      setMessage("נשמר");
      setTimeout(() => setMessage(""), 2000);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <li>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bakery-float-tile flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start"
        >
          <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <Palette className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
            סגנון, צבע ושפה לחנות
          </span>
          <ChevronLeft
            className="h-6 w-6 shrink-0 text-bakery-muted rtl:rotate-180"
            strokeWidth={2}
          />
        </button>
      </li>
    );
  }

  return (
    <li className="list-none">
      <div className="space-y-4 pt-1">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex items-center gap-1 text-[14px] font-bold text-bakery-primary"
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" strokeWidth={2} />
          חזרה
        </button>

        <h2 className="text-center text-[18px] font-extrabold text-bakery-ink">
          סגנון, צבע ושפה
        </h2>
        <p className="text-center text-[13px] font-semibold text-bakery-muted">
          בחרו צבעים ושפת ברירת מחדל — כך ייראה עמוד הלקוחות
        </p>

        <div className="rounded-[20px] border border-bakery-border/30 bg-bakery-card/60 p-3">
          <p className="mb-2 flex items-center justify-end gap-2 text-[14px] font-extrabold text-bakery-ink">
            <Languages className="h-4 w-4" strokeWidth={2} />
            שפת החנות ללקוחות
          </p>
          <div className="flex justify-center gap-2">
            {(
              [
                { id: "he" as const, label: "עברית" },
                { id: "en" as const, label: "English" },
              ] as const
            ).map((l) => (
              <button
                key={l.id}
                type="button"
                disabled={saving}
                onClick={() => saveAppearance({ storeLocale: l.id })}
                className={`rounded-full px-5 py-2 text-[14px] font-extrabold transition ${
                  locale === l.id
                    ? "bg-bakery-primary/15 text-bakery-primary ring-2 ring-bakery-primary/30"
                    : "border border-bakery-border/35 bg-bakery-input/80 text-bakery-ink"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[14px] font-bold text-bakery-ink">צבע החנות</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5">
          {STORE_THEMES.map((s) => {
            const active = theme === s.id;
            return (
              <button
                key={s.id}
                type="button"
                disabled={saving}
                onClick={() => saveAppearance({ storeTheme: s.id })}
                className={`bakery-float-tile flex flex-col items-center gap-1.5 rounded-[16px] px-1.5 py-2.5 ${
                  active ? "bakery-float-tile--active ring-2 ring-bakery-primary/35" : ""
                }`}
              >
                <span
                  className={`h-10 w-full rounded-[10px] bg-gradient-to-b ${s.preview}`}
                  aria-hidden
                />
                <span className="text-[12px] font-extrabold text-bakery-ink">{s.label}</span>
              </button>
            );
          })}
        </div>

        {message && (
          <p className="text-center text-[13px] font-semibold text-bakery-success">
            {message}
          </p>
        )}
      </div>
    </li>
  );
}
