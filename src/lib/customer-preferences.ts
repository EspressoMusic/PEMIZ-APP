import type { StoreThemeId } from "@/lib/store-themes";
import { parseStoreTheme, storeThemeLabel } from "@/lib/store-themes";

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

export function resolveCustomerLocale(
  slug: string,
  ownerLocale: CustomerLocale
): CustomerLocale {
  if (typeof window === "undefined") return ownerLocale;
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return ownerLocale;
    const parsed = JSON.parse(raw) as Partial<CustomerPreferences>;
    if (parsed.locale === "he" || parsed.locale === "en") return parsed.locale;
    return ownerLocale;
  } catch {
    return ownerLocale;
  }
}

export function loadCustomerPreferences(
  slug: string,
  ownerLocale: CustomerLocale = "en"
): CustomerPreferences {
  if (typeof window === "undefined") {
    return { ...DEFAULTS, locale: ownerLocale };
  }
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) {
      return { ...DEFAULTS, locale: ownerLocale };
    }
    const parsed = JSON.parse(raw) as Partial<CustomerPreferences>;
    return {
      locale: resolveCustomerLocale(slug, ownerLocale),
      theme: parseStoreTheme(parsed.theme),
      textScale:
        parsed.textScale === "110" || parsed.textScale === "125"
          ? parsed.textScale
          : "100",
    };
  } catch {
    return { ...DEFAULTS, locale: ownerLocale };
  }
}

export function saveCustomerPreferences(
  slug: string,
  prefs: CustomerPreferences
) {
  localStorage.setItem(storageKey(slug), JSON.stringify(prefs));
}

export function themeSubtitle(theme: CustomerDisplayTheme, locale: CustomerLocale) {
  const label = storeThemeLabel(theme, locale);
  return locale === "he" ? `מצב ${label}` : `${label} mode`;
}

export function localeThemeSummary(
  locale: CustomerLocale,
  theme: CustomerDisplayTheme
) {
  const localeLabel = locale === "he" ? "עברית" : "English";
  const themeLabel =
    locale === "he"
      ? `מצב ${storeThemeLabel(theme, "he")}`
      : `${storeThemeLabel(theme, "en")} mode`;
  return `${localeLabel} · ${themeLabel}`;
}
