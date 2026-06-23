import type { CapacitorConfig } from "@capacitor/cli";

const rawBase =
  process.env.CAPACITOR_SERVER_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const entryPath = (() => {
  const raw = process.env.CAPACITOR_ENTRY_PATH?.trim() || "/app";
  return raw.startsWith("/") ? raw : `/${raw}`;
})();

function buildServerUrl(base: string): string {
  try {
    const url = new URL(base);
    url.pathname = entryPath;
    url.search = "";
    url.hash = "";
    return `${url.origin}${url.pathname}`;
  } catch {
    return `${base.replace(/\/$/, "")}${entryPath}`;
  }
}

const serverUrl = buildServerUrl(rawBase);

const config: CapacitorConfig = {
  appId: "com.linky.app",
  appName: "Linky",
  webDir: "../public",
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
    androidScheme: "https",
  },
  android: {
    allowMixedContent: serverUrl.startsWith("http://"),
  },
  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      launchAutoHide: true,
      backgroundColor: "#E6D4B8",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#E6D4B8",
    },
  },
};

export default config;
