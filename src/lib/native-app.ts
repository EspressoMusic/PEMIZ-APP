/** True when running inside the Capacitor Android/iOS shell (Play Store / App Store build). */
export function isNativeCapacitorApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (
    window as Window & {
      Capacitor?: { isNativePlatform?: () => boolean };
    }
  ).Capacitor;
  return cap?.isNativePlatform?.() === true;
}

/** PWA standalone or native store app — skip browser install prompts. */
export function isInstalledApp(): boolean {
  if (typeof window === "undefined") return false;
  if (isNativeCapacitorApp()) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  );
}
