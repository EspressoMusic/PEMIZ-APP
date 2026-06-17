"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyDocumentLocale,
  formatAppDateTime,
  formatAppDayDate,
  formatAppMoney,
  formatAppNumber,
  getDashboardLabels,
  normalizeAppLocale,
  type AppLocale,
  type DashboardLabels,
} from "@/lib/app-locale";
import {
  hydrateDashboardLocale,
  writeDashboardLocaleSession,
} from "@/lib/dashboard-appearance-session";

type AppLocaleContextValue = {
  locale: AppLocale;
  labels: DashboardLabels;
  setLocale: (locale: AppLocale) => void;
  formatMoney: (amount: number) => string;
  formatNumber: (n: number) => string;
  formatDateTime: (iso: string) => string;
  formatDayDate: (iso: string) => string;
};

const AppLocaleContext = createContext<AppLocaleContextValue | null>(null);

export function AppLocaleProvider({
  children,
  initialLocale = "en",
}: {
  children: ReactNode;
  initialLocale?: string | null;
}) {
  const [locale, setLocaleState] = useState<AppLocale>(() =>
    normalizeAppLocale(initialLocale)
  );

  const setLocale = useCallback((next: AppLocale) => {
    const normalized = normalizeAppLocale(next);
    setLocaleState(normalized);
    applyDocumentLocale(normalized);
    writeDashboardLocaleSession(normalized);
  }, []);

  useLayoutEffect(() => {
    const fromDom = document.documentElement.dataset.locale;
    const hydrated =
      fromDom === "en" || fromDom === "he"
        ? fromDom
        : hydrateDashboardLocale(initialLocale);
    const normalized = normalizeAppLocale(hydrated);
    setLocaleState(normalized);
    applyDocumentLocale(normalized);
    if (fromDom !== "he" && fromDom !== "en" && normalized === "en") {
      writeDashboardLocaleSession("en");
    }
  }, [initialLocale]);

  const value = useMemo(
    () => ({
      locale,
      labels: getDashboardLabels(locale),
      setLocale,
      formatMoney: (amount: number) => formatAppMoney(amount, locale),
      formatNumber: (n: number) => formatAppNumber(n, locale),
      formatDateTime: (iso: string) => formatAppDateTime(iso, locale),
      formatDayDate: (iso: string) => formatAppDayDate(iso, locale),
    }),
    [locale, setLocale]
  );

  return (
    <AppLocaleContext.Provider value={value}>{children}</AppLocaleContext.Provider>
  );
}

export function useAppLocale() {
  const ctx = useContext(AppLocaleContext);
  if (!ctx) {
    const locale: AppLocale = "en";
    return {
      locale,
      labels: getDashboardLabels(locale),
      setLocale: () => {},
      formatMoney: (amount: number) => formatAppMoney(amount, locale),
      formatNumber: (n: number) => formatAppNumber(n, locale),
      formatDateTime: (iso: string) => formatAppDateTime(iso, locale),
      formatDayDate: (iso: string) => formatAppDayDate(iso, locale),
    };
  }
  return ctx;
}
