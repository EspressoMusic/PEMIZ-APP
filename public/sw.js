/* Linky/Peymiz push handler — v4 branded large icon */
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
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          return client.focus().then((focused) => {
            if ("navigate" in focused) {
              return focused.navigate(absolute);
            }
            return focused;
          });
        }
      }
      if (clients.openWindow) return clients.openWindow(absolute);
    })
  );
});
