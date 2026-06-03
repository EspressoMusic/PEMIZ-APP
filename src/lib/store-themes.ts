export const STORE_THEME_IDS = [
  "calm",
  "light",
  "dark",
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

export type StoreThemeId = (typeof STORE_THEME_IDS)[number];

export type StoreThemeMeta = {
  id: StoreThemeId;
  label: string;
  preview: string;
};

export const STORE_THEMES: StoreThemeMeta[] = [
  { id: "calm", label: "קרם", preview: "from-[#f5efe6] to-[#e6d7bd]" },
  { id: "light", label: "בהיר", preview: "from-[#ffffff] to-[#f0f0f0]" },
  { id: "dark", label: "כהה", preview: "from-[#3d4f5f] to-[#2a3844]" },
  { id: "rose", label: "ורוד", preview: "from-[#fce8ef] to-[#e8b4c8]" },
  { id: "mint", label: "מנטה", preview: "from-[#e8f7f0] to-[#b8e0ce]" },
  { id: "ocean", label: "ים", preview: "from-[#e6f2fa] to-[#a8cce8]" },
  { id: "lavender", label: "סגול", preview: "from-[#f0ebfa] to-[#c9b8e8]" },
  { id: "sunset", label: "שקיעה", preview: "from-[#fff0e6] to-[#f0c4a0]" },
  { id: "forest", label: "יער", preview: "from-[#e8f0e8] to-[#a8c4a8]" },
  { id: "peach", label: "אפרסק", preview: "from-[#fff5eb] to-[#f5d4b8]" },
  { id: "berry", label: "פטל", preview: "from-[#f5e8f5] to-[#d4a8d4]" },
  { id: "slate", label: "אפור", preview: "from-[#eef1f4] to-[#c5cdd6]" },
];

export function parseStoreTheme(value?: string | null): StoreThemeId {
  if (value && STORE_THEME_IDS.includes(value as StoreThemeId)) {
    return value as StoreThemeId;
  }
  return "calm";
}

export function customerThemeClass(theme: StoreThemeId): string {
  return `customer-theme-${theme}`;
}

export function isDarkStoreTheme(theme: StoreThemeId): boolean {
  return theme === "dark" || theme === "forest";
}
