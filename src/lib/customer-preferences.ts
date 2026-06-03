import type { StoreThemeId } from "@/lib/store-themes";
import { parseStoreTheme, STORE_THEMES } from "@/lib/store-themes";

export type CustomerLocale = "en" | "he";
export type CustomerDisplayTheme = StoreThemeId;
export type CustomerTextScale = "100" | "110" | "125";

export type CustomerPreferences = {
  locale: CustomerLocale;
  theme: CustomerDisplayTheme;
  textScale: CustomerTextScale;
};

const DEFAULTS: CustomerPreferences = {
  locale: "en",
  theme: "calm",
  textScale: "100",
};

function storageKey(slug: string) {
  return `linky-customer-prefs-${slug}`;
}

export function loadCustomerPreferences(slug: string): CustomerPreferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<CustomerPreferences>;
    return {
      locale: parsed.locale === "he" ? "he" : "en",
      theme: parseStoreTheme(parsed.theme),
      textScale:
        parsed.textScale === "110" || parsed.textScale === "125"
          ? parsed.textScale
          : "100",
    };
  } catch {
    return DEFAULTS;
  }
}

export function saveCustomerPreferences(
  slug: string,
  prefs: CustomerPreferences
) {
  localStorage.setItem(storageKey(slug), JSON.stringify(prefs));
}

export function themeSubtitle(theme: CustomerDisplayTheme, locale: CustomerLocale) {
  const label = STORE_THEMES.find((t) => t.id === theme)?.label ?? theme;
  return locale === "he" ? `ערכת צבע ${label}` : `${label} color theme`;
}

export function localeThemeSummary(
  locale: CustomerLocale,
  theme: CustomerDisplayTheme
) {
  const localeLabel = locale === "he" ? "עברית" : "English";
  const meta = STORE_THEMES.find((t) => t.id === theme);
  const themeLabel =
    locale === "he"
      ? `צבע ${meta?.label ?? theme}`
      : `${meta?.label ?? theme} theme`;
  return `${localeLabel} · ${themeLabel}`;
}
