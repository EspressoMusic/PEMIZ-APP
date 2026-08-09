/* Linky/Peymiz push handler — v6 pending-nav redirect for iOS PWA relaunch */
const PUSH_DB_NAME = "linky-push";
const PUSH_DB_STORE = "endpoints";
const PENDING_NAV_STORE = "pendingNav";

function openPushDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PUSH_DB_NAME, 2);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PUSH_DB_STORE)) {
        db.createObjectStore(PUSH_DB_STORE, { keyPath: "url" });
      }
      if (!db.objectStoreNames.contains(PENDING_NAV_STORE)) {
        db.createObjectStore(PENDING_NAV_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// iOS's PWA push implementation ignores the URL passed to clients.openWindow()
// when the app isn't already running and always relaunches at the manifest
// start_url instead (WebKit limitation) — so the destination is stashed here
// for the freshly-loaded page to pick up and redirect to itself.
async function rememberPendingNav(url) {
  const db = await openPushDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_NAV_STORE, "readwrite");
    tx.objectStore(PENDING_NAV_STORE).put({ id: "current", url, ts: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function rememberPushEndpoint(url, body) {
  const db = await openPushDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(PUSH_DB_STORE, "readwrite");
    tx.objectStore(PUSH_DB_STORE).put({ url, body: body || {} });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function getRememberedPushEndpoints() {
  const db = await openPushDb();
  const rows = await new Promise((resolve, reject) => {
    const tx = db.transaction(PUSH_DB_STORE, "readonly");
    const req = tx.objectStore(PUSH_DB_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return rows;
}

// Without this, an updated sw.js sits "waiting" until every open tab/PWA
// instance of the old one is fully closed — for a rarely-closed installed
// PWA that can be days. Take over immediately so this fix (and any future
// one) is live on next launch instead of next full app restart.
self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data?.text() ?? "" };
  }

  const title = payload.title || "Peymiz";
  // `icon` shows the full-color Peymiz logo (teal bg) inside the notification
  // card. `badge` is the tiny mandatory status-bar dot — Android always
  // renders it as a single-color silhouette tinted by the OS/phone theme, so
  // its color can't be set from here no matter what image is used.
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icons/notification-icon.png",
    badge: payload.badge || "/icons/notification-badge.png",
    tag: payload.tag || "linky-alert",
    data: { url: payload.url || "/dashboard" },
    dir: "rtl",
    lang: "he",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/dashboard";
  const absolute = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    (async () => {
      const list = await clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of list) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          const focused = await client.focus();
          if (focused && "navigate" in focused) {
            return focused.navigate(absolute);
          }
          return focused;
        }
      }

      if (targetUrl !== "/dashboard") {
        await rememberPendingNav(targetUrl).catch(() => undefined);
      }
      if (clients.openWindow) return clients.openWindow(absolute);
    })()
  );
});

// The page tells us (via postMessage, right after a successful subscribe)
// which server endpoint owns this subscription and what extra body fields
// it needs, so that a later pushsubscriptionchange can re-POST on its own —
// this is the only place that association is known, since the SW itself has
// no idea whether it's registered as a seller/master/customer device.
self.addEventListener("message", (event) => {
  const data = event.data;
  if (data && data.type === "linky-remember-push-endpoint" && typeof data.url === "string") {
    event.waitUntil(rememberPushEndpoint(data.url, data.body));
  }
});

// Browsers (Chrome/FCM in particular) can silently invalidate and rotate a
// push subscription in the background — no page is open to notice, and the
// old subscription just goes quiet forever unless something re-subscribes
// and reports the new endpoint to every server table that referenced the
// old one. This is that "something".
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const oldSubscription = event.oldSubscription;
      const applicationServerKey =
        event.newSubscription?.options?.applicationServerKey ||
        oldSubscription?.options?.applicationServerKey ||
        null;

      let subscription = event.newSubscription || null;
      if (!subscription) {
        try {
          subscription = await self.registration.pushManager.subscribe(
            applicationServerKey
              ? { userVisibleOnly: true, applicationServerKey }
              : { userVisibleOnly: true }
          );
        } catch {
          return;
        }
      }

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

      const targets = await getRememberedPushEndpoints().catch(() => []);
      await Promise.allSettled(
        targets.map((target) =>
          fetch(target.url, {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...target.body,
              endpoint: json.endpoint,
              keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
            }),
          }).catch(() => undefined)
        )
      );
    })()
  );
});
