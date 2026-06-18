import type { AppLocale } from "@/lib/app-locale";
import { normalizeAppLocale } from "@/lib/app-locale";
import {
  writeDashboardLocaleCookie,
  writeDashboardThemeCookie,
} from "@/lib/dashboard-appearance-boot";
import { parseStoreTheme, type StoreThemeId } from "@/lib/store-themes";

const LOCALE_KEY = "linky-dashboard-locale";
const THEME_KEY = "linky-dashboard-theme";

export function readDashboardLocaleSession(): AppLocale | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(LOCALE_KEY);
  return v === "en" || v === "he" ? v : null;
}

export function writeDashboardLocaleSession(locale: AppLocale) {
  if (typeof window === "undefined") return;
  const normalized = normalizeAppLocale(locale);
  sessionStorage.setItem(LOCALE_KEY, normalized);
  writeDashboardLocaleCookie(normalized);
}

export function readDashboardThemeSession(): StoreThemeId | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(THEME_KEY);
  if (!v) return null;
  return parseStoreTheme(v);
}

export function writeDashboardThemeSession(theme: StoreThemeId) {
  if (typeof window === "undefined") return;
  const parsed = parseStoreTheme(theme);
  sessionStorage.setItem(THEME_KEY, parsed);
  writeDashboardThemeCookie(parsed);
}

export function hydrateDashboardLocale(
  server: string | null | undefined
): AppLocale {
  return readDashboardLocaleSession() ?? normalizeAppLocale(server);
}

export function hydrateDashboardTheme(server: string | null | undefined): StoreThemeId {
  return readDashboardThemeSession() ?? parseStoreTheme(server);
}
