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

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
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

    return { status: "subscribed", endpoint: json.endpoint };
  } catch (error) {
    return { status: "error", error };
  }
}
