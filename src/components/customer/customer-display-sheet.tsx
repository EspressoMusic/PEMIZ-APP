"use client";

import { useEffect } from "react";
import { X, Languages, Globe } from "lucide-react";
import type { CustomerDisplayTheme, CustomerLocale } from "@/lib/customer-preferences";
import { themeSubtitle } from "@/lib/customer-preferences";
import { STORE_THEMES } from "@/lib/store-themes";

function SheetShell({
  open,
  onClose,
  title,
  locale,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  locale: CustomerLocale;
  children: React.ReactNode;
}) {
  const closeLabel = locale === "he" ? "סגור" : "Close";

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center lg:items-center lg:p-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/25 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <div className="relative flex max-h-[min(88dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-[var(--cs-sheet-bg,#fdf8f1)] shadow-[0_-8px_32px_rgba(58,47,38,0.18)] lg:max-h-[80vh] lg:rounded-[28px]">
        <div className="shrink-0 px-5 pt-3 lg:pt-5">
          <div
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-bakery-ink/20 lg:hidden"
            aria-hidden
          />
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-[18px] font-extrabold text-bakery-ink">{title}</h1>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[15px] font-semibold text-bakery-ink"
            >
              <X className="h-5 w-5" strokeWidth={2} />
              {closeLabel}
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}

function SelectTile({
  selected,
  onClick,
  icon: Icon,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  icon: typeof Languages;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start shadow-[0_3px_10px_rgba(58,47,38,0.12)] transition active:scale-[0.99] ${
        selected
          ? "bg-bakery-primary/12 ring-2 ring-bakery-primary/30"
          : "bg-bakery-square"
      }`}
    >
      <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
        <Icon className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-extrabold text-bakery-ink">{title}</span>
        {subtitle && (
          <span className="mt-1 block text-[13px] font-medium leading-snug text-bakery-muted">
            {subtitle}
          </span>
        )}
      </span>
    </button>
  );
}

export function CustomerDisplaySheet({
  open,
  onClose,
  locale,
  theme,
  onLocaleChange,
  onThemeChange,
}: {
  open: boolean;
  onClose: () => void;
  locale: CustomerLocale;
  theme: CustomerDisplayTheme;
  onLocaleChange: (locale: CustomerLocale) => void;
  onThemeChange: (theme: CustomerDisplayTheme) => void;
}) {
  const t = {
    sheetTitle: locale === "he" ? "שפה ומצב תצוגה" : "Language & display",
    language: locale === "he" ? "שפה" : "Language",
    display: locale === "he" ? "צבע וסגנון" : "Color & style",
    hebrew: "עברית",
    english: "English",
  };

  return (
    <SheetShell
      open={open}
      onClose={onClose}
      title={t.sheetTitle}
      locale={locale}
    >
      <section>
        <h2 className="mb-3 text-[17px] font-extrabold text-bakery-ink">{t.language}</h2>
        <ul className="space-y-2.5">
          <li>
            <SelectTile
              selected={locale === "he"}
              onClick={() => onLocaleChange("he")}
              icon={Languages}
              title={t.hebrew}
            />
          </li>
          <li>
            <SelectTile
              selected={locale === "en"}
              onClick={() => onLocaleChange("en")}
              icon={Globe}
              title={t.english}
            />
          </li>
        </ul>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-[17px] font-extrabold text-bakery-ink">{t.display}</h2>
        <div className="grid grid-cols-3 gap-2">
          {STORE_THEMES.map((s) => {
            const active = theme === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onThemeChange(s.id)}
                className={`flex flex-col items-center gap-1.5 rounded-[16px] border px-1.5 py-2.5 transition ${
                  active
                    ? "border-bakery-primary/40 bg-bakery-primary/10 ring-2 ring-bakery-primary/25"
                    : "border-bakery-border/30 bg-bakery-square"
                }`}
              >
                <span
                  className={`h-9 w-full rounded-[8px] bg-gradient-to-b ${s.preview}`}
                  aria-hidden
                />
                <span className="text-[11px] font-extrabold text-bakery-ink">{s.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center text-[12px] text-bakery-muted">
          {themeSubtitle(theme, locale)}
        </p>
      </section>
    </SheetShell>
  );
}
