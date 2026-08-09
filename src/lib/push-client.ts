export function normalizeVapidPublicKey(base64: string): string {
  return base64.trim().replace(/^['"]+|['"]+$/g, "");
}

export function isValidVapidPublicKey(base64: string): boolean {
  try {
    const bytes = urlBase64ToUint8Array(normalizeVapidPublicKey(base64));
    return bytes.length === 65;
  } catch {
    return false;
  }
}

export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

export async function registerLinkyServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    throw new Error("service_worker_unsupported");
  }
  try {
    await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    return await navigator.serviceWorker.ready;
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "registration failed";
    throw new Error(`service_worker_failed:${detail}`);
  }
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isInstalledPwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

export async function subscribeToPush(
  publicKey: string
): Promise<PushSubscription> {
  const normalizedKey = normalizeVapidPublicKey(publicKey);
  if (!isValidVapidPublicKey(normalizedKey)) {
    throw new Error("invalid_vapid_public_key");
  }

  const registration = await registerLinkyServiceWorker();
  const applicationServerKey = urlBase64ToUint8Array(
    normalizedKey
  ) as BufferSource;
  const subscribeOptions: PushSubscriptionOptionsInit = {
    userVisibleOnly: true,
    applicationServerKey,
  };

  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await existing.unsubscribe().catch(() => undefined);
  }

  try {
    return await registration.pushManager.subscribe(subscribeOptions);
  } catch (firstError) {
    const stale = await registration.pushManager.getSubscription();
    if (stale) {
      await stale.unsubscribe().catch(() => undefined);
    }
    try {
      return await registration.pushManager.subscribe(subscribeOptions);
    } catch {
      throw firstError;
    }
  }
}

const PUSH_DB_NAME = "linky-push";
const PENDING_NAV_STORE = "pendingNav";
const PENDING_NAV_MAX_AGE_MS = 30_000;

/**
 * Reads (and clears) the navigation target the service worker stashed for
 * iOS, whose PWA push implementation ignores the `clients.openWindow()` URL
 * and always relaunches at the manifest start_url instead. Returns null if
 * there's nothing pending or it's stale (e.g. a normal, non-notification
 * app launch).
 */
export async function consumePendingPushNav(): Promise<string | null> {
  if (typeof indexedDB === "undefined") return null;

  const db = await new Promise<IDBDatabase | null>((resolve) => {
    const req = indexedDB.open(PUSH_DB_NAME, 2);
    req.onupgradeneeded = () => {
      const idb = req.result;
      if (!idb.objectStoreNames.contains(PENDING_NAV_STORE)) {
        idb.createObjectStore(PENDING_NAV_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
  if (!db) return null;

  if (!db.objectStoreNames.contains(PENDING_NAV_STORE)) {
    db.close();
    return null;
  }

  const entry = await new Promise<{ url: string; ts: number } | undefined>(
    (resolve) => {
      const tx = db.transaction(PENDING_NAV_STORE, "readwrite");
      const store = tx.objectStore(PENDING_NAV_STORE);
      const getReq = store.get("current");
      getReq.onsuccess = () => resolve(getReq.result);
      getReq.onerror = () => resolve(undefined);
      store.delete("current");
    }
  );
  db.close();

  if (!entry) return null;
  if (Date.now() - entry.ts > PENDING_NAV_MAX_AGE_MS) return null;
  return entry.url;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getActivePushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported() || Notification.permission !== "granted") return null;
  const registration = await navigator.serviceWorker.getRegistration("/");
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

export type PushEnableOutcome =
  | { status: "subscribed"; endpoint: string }
  | { status: "denied" }
  | { status: "unconfigured" }
  | { status: "unsupported" }
  | { status: "ios_needs_install" }
  | { status: "error"; error: unknown };

export async function requestAndSubscribePush(
  configUrl = "/api/dashboard/push/config",
  subscribeUrl = "/api/dashboard/push/subscribe",
  extraBody?: Record<string, unknown>
): Promise<PushEnableOutcome> {
  if (!isPushSupported()) return { status: "unsupported" };
  if (isIosDevice() && !isInstalledPwa()) {
    return { status: "ios_needs_install" };
  }

  try {
    const configRes = await fetch(configUrl, { credentials: "same-origin" });
    const configData = (await configRes.json()) as {
      configured?: boolean;
      publicKey?: string | null;
    };
    if (!configRes.ok || !configData.configured || !configData.publicKey) {
      return { status: "unconfigured" };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { status: "denied" };

    const subscription = await subscribeToPush(configData.publicKey);
    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return { status: "error", error: new Error("invalid_subscription") };
    }

    const res = await fetch(subscribeUrl, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...extraBody,
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return {
        status: "error",
        error: new Error(data.error ?? "subscribe_failed"),
      };
    }

    // Let the service worker remember where this subscription came from, so
    // it can re-POST on its own if the browser rotates the subscription in
    // the background later (see `pushsubscriptionchange` in sw.js) — without
    // this, a silently-rotated subscription just goes quiet forever.
    try {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({
        type: "linky-remember-push-endpoint",
        url: subscribeUrl,
        body: extraBody ?? {},
      });
    } catch {
      // best-effort — worst case, auto-recovery doesn't kick in later
    }

    return { status: "subscribed", endpoint: json.endpoint };
  } catch (error) {
    return { status: "error", error };
  }
}
