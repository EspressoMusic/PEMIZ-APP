"use client";

import { useEffect, type ReactNode } from "react";
import { Languages, Globe, Leaf, Sun, Moon, X, type LucideIcon } from "lucide-react";
import type { CustomerDisplayTheme, CustomerLocale } from "@/lib/customer-preferences";
import { themeSubtitle } from "@/lib/customer-preferences";

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
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  const closeLabel = locale === "he" ? "סגור" : "Close";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center lg:items-center lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/25 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <div className="relative flex max-h-[min(88dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-[#fdf8f1] shadow-[0_-8px_32px_rgba(58,47,38,0.18)] lg:max-h-[80vh] lg:rounded-[28px]">
        <div className="shrink-0 px-5 pt-3 lg:pt-5">
          <div
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-bakery-ink/20 lg:hidden"
            aria-hidden
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[15px] font-semibold text-bakery-ink transition hover:bg-bakery-card/80"
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
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[22px] bg-[#e6d7c3] px-4 py-3.5 text-start shadow-[0_3px_10px_rgba(58,47,38,0.1)] transition ${
        selected
          ? "border-2 border-bakery-ink"
          : "border-2 border-transparent"
      } ${subtitle ? "items-start" : ""}`}
    >
      <Icon
        className={`shrink-0 text-bakery-ink ${subtitle ? "mt-0.5 h-6 w-6" : "h-6 w-6"}`}
        strokeWidth={1.75}
      />
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
    display: locale === "he" ? "מצב תצוגה" : "Display mode",
    hebrew: "עברית",
    english: "English",
    calm: locale === "he" ? "מצב רגוע" : "Calm mode",
    light: locale === "he" ? "מצב בהיר" : "Light mode",
    dark: locale === "he" ? "מצב כהה" : "Dark mode",
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
        <ul className="space-y-2.5">
          <li>
            <SelectTile
              selected={theme === "calm"}
              onClick={() => onThemeChange("calm")}
              icon={Leaf}
              title={t.calm}
              subtitle={themeSubtitle("calm", locale)}
            />
          </li>
          <li>
            <SelectTile
              selected={theme === "light"}
              onClick={() => onThemeChange("light")}
              icon={Sun}
              title={t.light}
              subtitle={themeSubtitle("light", locale)}
            />
          </li>
          <li>
            <SelectTile
              selected={theme === "dark"}
              onClick={() => onThemeChange("dark")}
              icon={Moon}
              title={t.dark}
              subtitle={themeSubtitle("dark", locale)}
            />
          </li>
        </ul>
      </section>
    </SheetShell>
  );
}
