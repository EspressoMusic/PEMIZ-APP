import { isNativeCapacitorApp } from "@/lib/native-app";

/** Typical Android status bar — used when env(safe-area-inset-top) is 0 in WebView. */
const ANDROID_STATUS_BAR_FALLBACK_PX = 32;

type StatusBarPlugin = {
  setOverlaysWebView?: (opts: { overlay: boolean }) => Promise<void>;
  setBackgroundColor?: (opts: { color: string }) => Promise<void>;
  setStyle?: (opts: { style: string }) => Promise<void>;
};

function readCssSafeAreaInset(side: "top" | "bottom"): number {
  if (typeof document === "undefined") return 0;
  const probe = document.createElement("div");
  probe.style.position = "fixed";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.paddingTop =
    side === "top" ? "env(safe-area-inset-top)" : "env(safe-area-inset-bottom)";
  document.body.appendChild(probe);
  const value =
    side === "top"
      ? parseFloat(getComputedStyle(probe).paddingTop)
      : parseFloat(getComputedStyle(probe).paddingBottom);
  probe.remove();
  return Number.isFinite(value) ? value : 0;
}

/** Configure status bar + CSS vars so native WebView content clears the system bar. */
export async function initNativeSafeArea(): Promise<void> {
  if (typeof window === "undefined" || !isNativeCapacitorApp()) return;

  const root = document.documentElement;
  root.classList.add("linky-native-app");

  const cap = (
    window as Window & {
      Capacitor?: { Plugins?: { StatusBar?: StatusBarPlugin } };
    }
  ).Capacitor;

  try {
    const statusBar = cap?.Plugins?.StatusBar;
    if (statusBar?.setOverlaysWebView) {
      await statusBar.setOverlaysWebView({ overlay: false });
    }
    if (statusBar?.setBackgroundColor) {
      await statusBar.setBackgroundColor({ color: "#E6D4B8" });
    }
    if (statusBar?.setStyle) {
      await statusBar.setStyle({ style: "DARK" });
    }
  } catch {
    // StatusBar plugin unavailable — CSS fallback below.
  }

  const envTop = readCssSafeAreaInset("top");
  const envBottom = readCssSafeAreaInset("bottom");
  const viewportTop = window.visualViewport?.offsetTop ?? 0;

  const topPx = Math.max(
    envTop,
    viewportTop,
    envTop > 0 ? 0 : ANDROID_STATUS_BAR_FALLBACK_PX
  );

  root.style.setProperty("--app-safe-top", `${topPx}px`);
  root.style.setProperty("--app-safe-bottom", `${envBottom}px`);
}
