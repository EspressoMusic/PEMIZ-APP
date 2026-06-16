import { isNativeCapacitorApp } from "@/lib/native-app";

const MIGRATION_FLAG = "linky-device-storage-migrated-v1";
const KEY_PREFIX = "linky-";

let nativeCache: Map<string, string> | null = null;
let initPromise: Promise<void> | null = null;

export function customerNameKey(slug: string) {
  return `linky-customer-${slug}`;
}

export function customerInquiryPhoneKey(slug: string) {
  return `linky-inquiry-phone-${slug}`;
}

export function isCustomerDeviceKey(key: string) {
  return key.startsWith(KEY_PREFIX);
}

/** Loads app-private storage on native (Capacitor Preferences). No-op on web. */
export async function initCustomerDeviceStorage(): Promise<void> {
  if (!isNativeCapacitorApp() || typeof window === "undefined") return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const { Preferences } = await import("@capacitor/preferences");
    const { value: migrated } = await Preferences.get({ key: MIGRATION_FLAG });

    if (migrated !== "1") {
      const keysToMigrate: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && isCustomerDeviceKey(key)) keysToMigrate.push(key);
      }
      for (const key of keysToMigrate) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          await Preferences.set({ key, value });
          localStorage.removeItem(key);
        }
      }
      await Preferences.set({ key: MIGRATION_FLAG, value: "1" });
    }

    nativeCache = new Map();
    const { keys } = await Preferences.keys();
    for (const key of keys) {
      if (!isCustomerDeviceKey(key) || key === MIGRATION_FLAG) continue;
      const { value } = await Preferences.get({ key });
      if (value != null) nativeCache.set(key, value);
    }
  })();

  return initPromise;
}

export function getCustomerDeviceItem(key: string): string | null {
  if (nativeCache) return nativeCache.get(key) ?? null;
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

export function setCustomerDeviceItem(key: string, value: string): void {
  if (nativeCache) {
    nativeCache.set(key, value);
    void import("@capacitor/preferences").then(({ Preferences }) =>
      Preferences.set({ key, value })
    );
    return;
  }
  if (typeof window !== "undefined") localStorage.setItem(key, value);
}

export function removeCustomerDeviceItem(key: string): void {
  if (nativeCache) {
    nativeCache.delete(key);
    void import("@capacitor/preferences").then(({ Preferences }) =>
      Preferences.remove({ key })
    );
    return;
  }
  if (typeof window !== "undefined") localStorage.removeItem(key);
}
