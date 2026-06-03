"use client";

import { useState } from "react";
import { Palette } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { useStoreTheme } from "@/components/dashboard/store-theme-provider";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import type { CustomerLocale } from "@/lib/customer-preferences";
import {
  STORE_THEMES,
  parseStoreTheme,
  storeThemeLabel,
  type StoreThemeId,
} from "@/lib/store-themes";

export function DashboardStoreStylePicker({
  previewOnly = false,
}: {
  previewOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { locale, labels, setLocale: setAppLocale } = useAppLocale();
  const { theme, setTheme: setAppTheme } = useStoreTheme();

  async function saveAppearance(patch: {
    storeTheme?: StoreThemeId;
    storeLocale?: CustomerLocale;
  }) {
    if (patch.storeTheme != null) setAppTheme(patch.storeTheme);
    if (patch.storeLocale != null) setAppLocale(patch.storeLocale);
    if (previewOnly) return;

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/dashboard/store-theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        storeTheme?: string;
        storeLocale?: string;
      };
      if (!res.ok) {
        setMessage(data.error ?? labels.saveError);
        return;
      }
      if (data.storeTheme != null) setAppTheme(parseStoreTheme(data.storeTheme));
      if (data.storeLocale != null) {
        setAppLocale(data.storeLocale === "en" ? "en" : "he");
      }
      setMessage(labels.saved);
      setTimeout(() => setMessage(""), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <li>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bakery-float-tile flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start"
        >
          <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <Palette className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
            {labels.styleColorLanguage}
          </span>
        </button>
      </li>

      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={labels.stylePanelTitle}
      >
        <div className="space-y-4">
          <div className="rounded-[20px] border border-bakery-border/30 bg-bakery-card/60 p-3">
            <p className="mb-2 w-full text-center text-[14px] font-extrabold text-bakery-ink">
              {labels.storeLanguageForCustomers}
            </p>
            <div className="flex justify-center gap-2">
              {(
                [
                  { id: "he" as const, label: labels.hebrew },
                  { id: "en" as const, label: labels.english },
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

          <p className="text-center text-[14px] font-bold text-bakery-ink">
            {labels.storeMode}
          </p>
          <div className="flex flex-col gap-2">
            {STORE_THEMES.map((s) => {
              const active = theme === s.id;
              const title = storeThemeLabel(s.id, locale);
              const subtitle = locale === "he" ? s.descriptionHe : s.descriptionEn;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={saving}
                  onClick={() => saveAppearance({ storeTheme: s.id })}
                  className={`bakery-float-tile flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-start ${
                    active ? "bakery-float-tile--active ring-2 ring-bakery-primary/35" : ""
                  }`}
                >
                  <span
                    className={`h-10 w-14 shrink-0 rounded-[10px] bg-gradient-to-b ${s.preview}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-extrabold text-bakery-ink">
                      {title}
                    </span>
                    <span className="block text-[12px] font-semibold text-bakery-muted">
                      {subtitle}
                    </span>
                  </span>
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
      </DashboardActionSheet>
    </>
  );
}
