import { parseStoreTheme, type StoreThemeId } from "@/lib/store-themes";

export function applyDocumentStoreTheme(theme: StoreThemeId) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.storeTheme = parseStoreTheme(theme);
}
