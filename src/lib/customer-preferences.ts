import { resolveSiteLocale, SITE_LOCALE } from "@/lib/site-locale";
import {
  DEFAULT_STORE_THEME,
  parseStoreTheme,
  storeThemeLabel,
  type StoreThemeId,
} from "@/lib/store-themes";
import { getCustomerDeviceItem, setCustomerDeviceItem } from "@/lib/customer-device-storage";

export type CustomerLocale = "en" | "he";
export type CustomerDisplayTheme = StoreThemeId;
export type CustomerTextScale = "100" | "110" | "125";

export type CustomerPreferences = {
  locale: CustomerLocale;
  theme: CustomerDisplayTheme;
  textScale: CustomerTextScale;
};

const DEFAULTS: CustomerPreferences = {
  locale: SITE_LOCALE,
  theme: DEFAULT_STORE_THEME,
  textScale: "100",
};

function storageKey(slug: string) {
  return `linky-customer-prefs-${slug}`;
}

export function resolveCustomerLocale(
  _slug: string,
  ownerLocale: CustomerLocale
): CustomerLocale {
  return resolveSiteLocale(ownerLocale);
}

export function loadCustomerPreferences(
  slug: string,
  ownerLocale: CustomerLocale = SITE_LOCALE
): CustomerPreferences {
  if (typeof window === "undefined") {
    return { ...DEFAULTS, locale: ownerLocale };
  }
  try {
    const raw = getCustomerDeviceItem(storageKey(slug));
    if (!raw) {
      return { ...DEFAULTS, locale: ownerLocale };
    }
    const parsed = JSON.parse(raw) as Partial<CustomerPreferences>;
    return {
      locale:
        parsed.locale === "he" || parsed.locale === "en"
          ? parsed.locale
          : ownerLocale,
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
  setCustomerDeviceItem(storageKey(slug), JSON.stringify(prefs));
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
