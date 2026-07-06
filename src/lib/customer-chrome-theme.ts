import type { StoreThemeId } from "@/lib/store-themes";
import { isNativeCapacitorApp } from "@/lib/native-app";

type StatusBarPlugin = {
  setBackgroundColor?: (opts: { color: string }) => Promise<void>;
  setStyle?: (opts: { style: string }) => Promise<void>;
};

export type CustomerChromeTheme = {
  scaffold: string;
  statusBarStyle: "DARK" | "LIGHT";
};

/** Top chrome (safe area + status bar) per customer display theme */
export const CUSTOMER_CHROME_THEMES: Record<StoreThemeId, CustomerChromeTheme> = {
  turquoise: { scaffold: "#ffffff", statusBarStyle: "DARK" },
  calm: { scaffold: "#faf6f0", statusBarStyle: "DARK" },
  light: { scaffold: "#ffffff", statusBarStyle: "DARK" },
  dark: { scaffold: "#0f1114", statusBarStyle: "LIGHT" },
};

const THEME_COLOR_META_ID = "linky-theme-color";

function readStatusBarPlugin(): StatusBarPlugin | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window as Window & {
      Capacitor?: { Plugins?: { StatusBar?: StatusBarPlugin } };
    }
  ).Capacitor?.Plugins?.StatusBar;
}

function updateThemeColorMeta(color: string): void {
  if (typeof document === "undefined") return;
  let meta =
    document.querySelector<HTMLMetaElement>(`meta#${THEME_COLOR_META_ID}`) ??
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.id = THEME_COLOR_META_ID;
    document.head.appendChild(meta);
  }
  meta.content = color;
}

/** Sync page chrome (safe-area backdrop, browser theme-color, native status bar). */
export function applyCustomerChromeTheme(theme: StoreThemeId): void {
  if (typeof document === "undefined") return;

  const chrome = CUSTOMER_CHROME_THEMES[theme] ?? CUSTOMER_CHROME_THEMES.turquoise;
  const root = document.documentElement;

  root.dataset.customerChromeTheme = theme;
  root.style.setProperty("--bakery-scaffold", chrome.scaffold);
  root.style.setProperty("--background", chrome.scaffold);
  updateThemeColorMeta(chrome.scaffold);

  if (!isNativeCapacitorApp()) return;

  const statusBar = readStatusBarPlugin();
  void statusBar?.setBackgroundColor?.({ color: chrome.scaffold });
  void statusBar?.setStyle?.({ style: chrome.statusBarStyle });
}

export function clearCustomerChromeTheme(): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  delete root.dataset.customerChromeTheme;
  root.style.removeProperty("--bakery-scaffold");
  root.style.removeProperty("--background");
}
