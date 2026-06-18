import type { AppLocale } from "@/lib/app-locale";
import { normalizeAppLocale } from "@/lib/app-locale";
import { MARKETING_LOCALE_KEY } from "@/lib/marketing-locale";
import { parseStoreTheme, type StoreThemeId } from "@/lib/store-themes";

export const DASHBOARD_THEME_COOKIE = "linky-dashboard-theme";
export const DASHBOARD_LOCALE_COOKIE = "linky-dashboard-locale";

const THEME_KEY = "linky-dashboard-theme";
const LOCALE_KEY = "linky-dashboard-locale";

/** Runs in <head> before paint — avoids calm (brown) flash when theme is dark/light */
export const DASHBOARD_APPEARANCE_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;var t=sessionStorage.getItem("${THEME_KEY}");if(t==="dark"||t==="light"||t==="calm")d.setAttribute("data-store-theme",t);var l=sessionStorage.getItem("${LOCALE_KEY}");if(l!=="he"&&l!=="en"){var m=localStorage.getItem("${MARKETING_LOCALE_KEY}");if(m==="he"||m==="en")l=m;else{var c=document.cookie.match(/(?:^|; )linky-dashboard-locale=([^;]*)/);l=c&&decodeURIComponent(c[1])==="en"?"en":"he";}}if(l!=="en")l="he";d.setAttribute("data-locale",l);d.lang=l==="he"?"he":"en";d.dir=l==="he"?"rtl":"ltr";sessionStorage.setItem("${LOCALE_KEY}",l);}catch(e){}})();`;

export function writeDashboardThemeCookie(theme: StoreThemeId) {
  if (typeof document === "undefined") return;
  document.cookie = `${DASHBOARD_THEME_COOKIE}=${encodeURIComponent(parseStoreTheme(theme))};path=/;max-age=${60 * 60 * 24 * 400};samesite=lax`;
}

export function writeDashboardLocaleCookie(locale: AppLocale) {
  if (typeof document === "undefined") return;
  const normalized = normalizeAppLocale(locale);
  document.cookie = `${DASHBOARD_LOCALE_COOKIE}=${normalized};path=/;max-age=${60 * 60 * 24 * 400};samesite=lax`;
}

export function parseThemeCookie(value: string | undefined): StoreThemeId | null {
  if (!value) return null;
  try {
    return parseStoreTheme(decodeURIComponent(value));
  } catch {
    return parseStoreTheme(value);
  }
}

export function parseLocaleCookie(value: string | undefined): AppLocale | null {
  return value === "en" || value === "he" ? value : null;
}
