export const STORE_THEME_IDS = ["turquoise", "calm", "light", "dark"] as const;

export type StoreThemeId = (typeof STORE_THEME_IDS)[number];

export const DEFAULT_STORE_THEME: StoreThemeId = "turquoise";

/** Optional decorative overlay, layered on top of any store theme (e.g. floral border). */
export const STORE_DECORATION_IDS = ["none", "flowers", "doodles", "stars"] as const;

export type StoreDecorationId = (typeof STORE_DECORATION_IDS)[number];

export const DEFAULT_STORE_DECORATION: StoreDecorationId = "none";

export type StoreDecorationMeta = {
  id: StoreDecorationId;
  label: string;
  labelEn: string;
  descriptionHe: string;
  descriptionEn: string;
};

export const STORE_DECORATIONS: StoreDecorationMeta[] = [
  {
    id: "none",
    label: "ללא",
    labelEn: "None",
    descriptionHe: "בלי עיטור נוסף",
    descriptionEn: "No extra decoration",
  },
  {
    id: "flowers",
    label: "פרחים",
    labelEn: "Flowers",
    descriptionHe: "מסגרת פרחים סביב התפריט",
    descriptionEn: "Floral border around the menu",
  },
  {
    id: "doodles",
    label: "דודלים",
    labelEn: "Doodles",
    descriptionHe: "איורים קטנים ברקע התפריט, בסגנון וואטסאפ",
    descriptionEn: "Small doodle icons behind the menu, WhatsApp style",
  },
  {
    id: "stars",
    label: "כוכבים",
    labelEn: "Stars",
    descriptionHe: "שמיים כהים עם כוכבים נוצצים",
    descriptionEn: "Dark night sky with sparkling stars",
  },
];

export function parseStoreDecoration(value?: string | null): StoreDecorationId {
  return value != null &&
    (STORE_DECORATION_IDS as readonly string[]).includes(value)
    ? (value as StoreDecorationId)
    : DEFAULT_STORE_DECORATION;
}

export function storeDecorationLabel(
  decoration: StoreDecorationId,
  locale: "he" | "en" = "he"
): string {
  const meta = STORE_DECORATIONS.find((d) => d.id === decoration);
  if (!meta) return decoration;
  return locale === "he" ? meta.label : meta.labelEn;
}

export function storeDecorationDescription(
  decoration: StoreDecorationId,
  locale: "he" | "en" = "he"
): string {
  const meta = STORE_DECORATIONS.find((d) => d.id === decoration);
  if (!meta) return "";
  return locale === "he" ? meta.descriptionHe : meta.descriptionEn;
}

export function customerDecorationClass(decoration: StoreDecorationId): string {
  return `customer-decoration-${decoration}`;
}

/** Legacy colorful themes — mapped to relaxed brown on read */
const LEGACY_THEME_IDS = [
  "rose",
  "mint",
  "ocean",
  "lavender",
  "sunset",
  "forest",
  "peach",
  "berry",
  "slate",
] as const;

export type StoreThemeMeta = {
  id: StoreThemeId;
  label: string;
  labelEn: string;
  preview: string;
  descriptionHe: string;
  descriptionEn: string;
};

export const STORE_THEMES: StoreThemeMeta[] = [
  {
    id: "turquoise",
    label: "טורקיז",
    labelEn: "Turquoise",
    preview: "from-[#ffffff] to-[#0d9488]",
    descriptionHe: "לבן וטורקיז — ברירת המחדל",
    descriptionEn: "White & turquoise",
  },
  {
    id: "calm",
    label: "רגוע",
    labelEn: "Relaxed",
    preview: "from-[#f5efe6] to-[#c9b89a]",
    descriptionHe: "חום קרם — הסגנון הקלאסי",
    descriptionEn: "Warm cream & brown",
  },
  {
    id: "light",
    label: "בהיר",
    labelEn: "Light",
    preview: "from-[#ffffff] to-[#e5e5e5]",
    descriptionHe: "שחור ולבן",
    descriptionEn: "Black & white",
  },
  {
    id: "dark",
    label: "כהה",
    labelEn: "Dark",
    preview: "from-[#3a3a3a] to-[#0f0f0f]",
    descriptionHe: "ממשק כהה עם טקסט בהיר וברור",
    descriptionEn: "Dark UI with clear light text",
  },
];

export function parseStoreTheme(value?: string | null): StoreThemeId {
  if (
    value === "turquoise" ||
    value === "light" ||
    value === "dark" ||
    value === "calm"
  ) {
    return value;
  }
  if (value === "modern") {
    return "turquoise";
  }
  if (
    value &&
    (LEGACY_THEME_IDS as readonly string[]).includes(value)
  ) {
    return "calm";
  }
  return DEFAULT_STORE_THEME;
}

export function storeThemeLabel(
  theme: StoreThemeId,
  locale: "he" | "en" = "he"
): string {
  const meta = STORE_THEMES.find((t) => t.id === theme);
  if (!meta) return theme;
  return locale === "he" ? meta.label : meta.labelEn;
}

export function customerThemeClass(theme: StoreThemeId): string {
  return `customer-theme-${theme}`;
}

export function isDarkStoreTheme(theme: StoreThemeId): boolean {
  return theme === "dark";
}

const NOTIFICATION_ICON_BY_THEME: Record<StoreThemeId, string> = {
  turquoise: "/icons/notification-icon.png",
  calm: "/icons/notification-icon-calm.png",
  light: "/icons/notification-icon-light.png",
  dark: "/icons/notification-icon-dark.png",
};

/** Push-notification icon tinted to match the store's chosen theme. */
export function notificationIconForTheme(theme?: string | null): string {
  return NOTIFICATION_ICON_BY_THEME[parseStoreTheme(theme)];
}
