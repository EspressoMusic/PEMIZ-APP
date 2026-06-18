"use client";

import type { MarketingCopy, MarketingLocale } from "@/lib/marketing-locale";

export function MarketingLocaleToggle({
  locale,
  onToggle,
  copy,
  className = "locale-toggle",
}: {
  locale: MarketingLocale;
  onToggle: () => void;
  copy: MarketingCopy;
  className?: string;
}) {
  const nextLabel = locale === "en" ? copy.localeHe : copy.localeEn;

  return (
    <button
      type="button"
      className={className}
      aria-label={copy.toggleLocale}
      title={copy.toggleLocale}
      onClick={onToggle}
    >
      <span className="locale-toggle-label">{nextLabel}</span>
    </button>
  );
}
