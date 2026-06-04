"use client";

import { Languages, Globe, X } from "lucide-react";
import type { CustomerDisplayTheme, CustomerLocale } from "@/lib/customer-preferences";
import { STORE_THEMES, storeThemeLabel } from "@/lib/store-themes";
import { CustomerCenterModal } from "@/components/customer/customer-center-modal";

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
          ? "bg-bakery-primary text-bakery-on-primary shadow-[0_3px_10px_rgba(58,47,38,0.2)]"
          : "bg-bakery-square text-bakery-ink"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${
          selected ? "bg-bakery-on-primary/15" : "bakery-icon-tile"
        }`}
      >
        <Icon
          className={`h-6 w-6 ${selected ? "text-bakery-on-primary" : "text-bakery-ink"}`}
          strokeWidth={1.75}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-extrabold">{title}</span>
        {subtitle && (
          <span
            className={`mt-1 block text-[13px] font-medium leading-snug ${
              selected ? "text-bakery-on-primary/80" : "text-bakery-muted"
            }`}
          >
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
    hebrew: locale === "he" ? "עברית" : "Hebrew",
    english: "English",
  };

  const closeLabel = locale === "he" ? "סגור" : "Close";

  return (
    <CustomerCenterModal
      open={open}
      onClose={onClose}
      locale={locale}
      storeTheme={theme}
      ariaLabel={t.sheetTitle}
      header={
        <div className="flex shrink-0 justify-end border-b border-bakery-border/25 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[15px] font-semibold text-bakery-ink transition hover:bg-bakery-card/80"
          >
            <X className="h-5 w-5" strokeWidth={2} />
            {closeLabel}
          </button>
        </div>
      }
    >
      <div className="px-4 py-4">
      <section>
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

      <section className="mt-5">
        <ul className="space-y-2">
          {STORE_THEMES.map((s) => {
            const active = theme === s.id;
            const title = storeThemeLabel(s.id, locale);
            const subtitle = locale === "he" ? s.descriptionHe : s.descriptionEn;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onThemeChange(s.id)}
                  className={`flex w-full items-center gap-3 rounded-[16px] border px-3 py-2.5 text-start transition active:scale-[0.99] ${
                    active
                      ? "border-bakery-primary bg-bakery-primary text-bakery-on-primary shadow-[0_3px_10px_rgba(58,47,38,0.2)]"
                      : "border-bakery-border/30 bg-bakery-square text-bakery-ink"
                  }`}
                >
                  <span
                    className={`h-10 w-14 shrink-0 rounded-[10px] bg-gradient-to-b ring-1 ${s.preview} ${
                      active ? "ring-bakery-on-primary/40" : "ring-bakery-border/25"
                    }`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-extrabold">{title}</span>
                    <span
                      className={`block text-[12px] font-semibold ${
                        active ? "text-bakery-on-primary/80" : "text-bakery-muted"
                      }`}
                    >
                      {subtitle}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
      </div>
    </CustomerCenterModal>
  );
}
