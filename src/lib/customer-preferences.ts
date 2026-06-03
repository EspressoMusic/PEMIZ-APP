export type CustomerLocale = "en" | "he";
export type CustomerDisplayTheme = "calm" | "light" | "dark";
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
      theme:
        parsed.theme === "light" || parsed.theme === "dark"
          ? parsed.theme
          : "calm",
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
  const en = {
    calm: "Soft cream — like the tiles",
    light: "Black & white only — high contrast",
    dark: "Dark blue & white — high contrast",
  };
  const he = {
    calm: "קרם רך — כמו האריחים",
    light: "שחור ולבן בלבד — ניגודיות גבוהה",
    dark: "כחול כהה ולבן — ניגודיות גבוהה",
  };
  return (locale === "he" ? he : en)[theme];
}

export function localeThemeSummary(
  locale: CustomerLocale,
  theme: CustomerDisplayTheme
) {
  const localeLabel = locale === "he" ? "עברית" : "English";
  const themeLabel =
    locale === "he"
      ? { calm: "מצב רגוע", light: "מצב בהיר", dark: "מצב כהה" }[theme]
      : { calm: "Calm mode", light: "Light mode", dark: "Dark mode" }[theme];
  return `${localeLabel} · ${themeLabel}`;
}
