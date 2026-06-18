"use client";

import type { ReactNode } from "react";
import { MarketingLocaleToggle } from "@/components/marketing/marketing-locale-toggle";
import {
  MarketingLocaleProvider,
  useMarketingLocale,
} from "@/components/marketing/marketing-locale-provider";
import { homeLandingFontClass } from "@/lib/fonts/marketing-fonts";

/** Public landing page shell */
export function HomeLandingShell({ children }: { children: ReactNode }) {
  return (
    <MarketingLocaleProvider>
      <HomeLandingShellInner>{children}</HomeLandingShellInner>
    </MarketingLocaleProvider>
  );
}

function HomeLandingShellInner({ children }: { children: ReactNode }) {
  const { locale, toggleLocale, copy } = useMarketingLocale();

  return (
    <div
      className={`home-landing-bg flex min-h-dvh flex-col ${homeLandingFontClass(locale)}`}
      lang={locale === "he" ? "he" : "en"}
      dir={locale === "he" ? "rtl" : "ltr"}
    >
      <div className="app-safe-x flex justify-end px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
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
