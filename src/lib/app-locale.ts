import type { CustomerLocale } from "@/lib/customer-preferences";
import {
  DASHBOARD_LABELS,
  getOrderDayLabels,
  type DashboardLabels,
} from "@/lib/dashboard-messages";

export type AppLocale = CustomerLocale;

export type { DashboardLabels };

export function normalizeAppLocale(value: string | null | undefined): AppLocale {
  return value === "en" ? "en" : "he";
}

export function localeTag(locale: AppLocale): string {
  return locale === "en" ? "en-US" : "he-IL";
}

export function formatAppMoney(amount: number, locale: AppLocale): string {
  const value = amount.toFixed(2);
  return locale === "he" ? `₪${value}` : `$${value}`;
}

export function formatAppNumber(n: number, locale: AppLocale): string {
  return n.toLocaleString(localeTag(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatAppDateTime(iso: string, locale: AppLocale): string {
  return new Date(iso).toLocaleString(localeTag(locale), {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function formatAppDayDate(iso: string, locale: AppLocale): string {
  return new Date(iso).toLocaleString(localeTag(locale), {
    weekday: "long",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export function applyDocumentLocale(locale: AppLocale) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.lang = locale === "en" ? "en" : "he";
  root.dir = locale === "en" ? "ltr" : "rtl";
  root.dataset.locale = locale;
}

export function getDashboardLabels(locale: AppLocale): DashboardLabels {
  return DASHBOARD_LABELS[locale];
}

export { getOrderDayLabels };
