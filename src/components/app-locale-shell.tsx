"use client";

import type { ReactNode } from "react";
import { MarketingLocaleToggle } from "@/components/marketing/marketing-locale-toggle";
import {
  MarketingLocaleProvider,
  useMarketingLocale,
} from "@/components/marketing/marketing-locale-provider";
import { homeLandingFontClass } from "@/lib/fonts/marketing-fonts";

export function AppLocaleShell({ children }: { children: ReactNode }) {
  return (
    <MarketingLocaleProvider>
      <AppLocaleShellInner>{children}</AppLocaleShellInner>
    </MarketingLocaleProvider>
  );
}

function AppLocaleShellInner({ children }: { children: ReactNode }) {
  const { locale, toggleLocale, copy } = useMarketingLocale();

  return (
    <div
      className={`flex min-h-dvh flex-col ${homeLandingFontClass(locale)}`}
      lang={locale === "he" ? "he" : "en"}
      dir={locale === "he" ? "rtl" : "ltr"}
    >
      <div className="app-safe-x flex shrink-0 justify-end px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <MarketingLocaleToggle
          locale={locale}
          onToggle={toggleLocale}
          copy={copy}
          className="home-locale-toggle"
        />
      </div>
      {children}
    </div>
  );
}
