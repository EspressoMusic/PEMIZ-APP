"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  MARKETING_COPY,
  MARKETING_LOCALE_KEY,
  applyMarketingLocale,
  normalizeMarketingLocale,
  type MarketingCopy,
  type MarketingLocale,
} from "@/lib/marketing-locale";
import { writeDashboardLocaleCookie } from "@/lib/dashboard-appearance-boot";

type MarketingLocaleContextValue = {
  locale: MarketingLocale;
  setLocale: (locale: MarketingLocale) => void;
  toggleLocale: () => void;
  copy: MarketingCopy;
  ready: boolean;
};

const MarketingLocaleContext = createContext<MarketingLocaleContextValue | null>(
  null
);

export function MarketingLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<MarketingLocale>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = normalizeMarketingLocale(
      localStorage.getItem(MARKETING_LOCALE_KEY)
    );
    setLocaleState(saved);
    applyMarketingLocale(saved);
    setReady(true);
  }, []);

  const setLocale = useCallback((next: MarketingLocale) => {
    setLocaleState(next);
    localStorage.setItem(MARKETING_LOCALE_KEY, next);
    writeDashboardLocaleCookie(next);
    applyMarketingLocale(next);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next: MarketingLocale = prev === "en" ? "he" : "en";
      localStorage.setItem(MARKETING_LOCALE_KEY, next);
      writeDashboardLocaleCookie(next);
      applyMarketingLocale(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      copy: MARKETING_COPY[locale],
      ready,
    }),
    [locale, setLocale, toggleLocale, ready]
  );

  return (
    <MarketingLocaleContext.Provider value={value}>
      {children}
    </MarketingLocaleContext.Provider>
  );
}

export function useMarketingLocale() {
  const ctx = useContext(MarketingLocaleContext);
  if (!ctx) {
    throw new Error("useMarketingLocale must be used within MarketingLocaleProvider");
  }
  return ctx;
}
