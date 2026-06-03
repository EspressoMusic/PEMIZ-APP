"use client";

import { Languages, Globe } from "lucide-react";
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
          ? "bg-bakery-cream-light ring-2 ring-bakery-primary/35"
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
    hebrew: locale === "he" ? "עברית" : "Hebrew",
    english: "English",
  };

  return (
    <CustomerCenterModal
      open={open}
      onClose={onClose}
      title={t.sheetTitle}
      locale={locale}
      storeTheme={theme}
    >
      <div className="px-4 py-4">
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
                  className={`flex w-full items-center gap-3 rounded-[16px] border px-3 py-2.5 text-start transition ${
                    active
                      ? "border-bakery-primary/40 bg-bakery-cream-light ring-2 ring-bakery-primary/30"
                      : "border-bakery-border/30 bg-bakery-square"
                  }`}
                >
                  <span
                    className={`h-10 w-14 shrink-0 rounded-[10px] bg-gradient-to-b ${s.preview}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-extrabold text-bakery-ink">
                      {title}
                    </span>
                    <span className="block text-[12px] font-semibold text-bakery-muted">
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
