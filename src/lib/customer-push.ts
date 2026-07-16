import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { configureWebPush, isPushConfigured } from "@/lib/seller-push";
import { notificationIconForTheme } from "@/lib/store-themes";

export async function notifyAppointmentWaitlist(
  businessId: string,
  business: { name: string; slug: string; storeLocale: string; storeTheme?: string | null }
) {
  if (!isPushConfigured()) return;

  try {
    const subs = await prisma.appointmentWaitlistSubscription.findMany({
      where: { businessId },
    });
    if (subs.length === 0) return;

    const pushKeys = await prisma.customerPushSubscription.findMany({
      where: { endpoint: { in: subs.map((s) => s.endpoint) } },
    });
    const keysByEndpoint = new Map(pushKeys.map((k) => [k.endpoint, k]));

    configureWebPush();
    const title =
      business.storeLocale === "en"
        ? `A slot opened up at ${business.name}`
        : `התפנה תור אצל ${business.name}`;
    const body =
      business.storeLocale === "en"
        ? "Check availability now"
        : "בדקו זמינות עכשיו";
    const payload = JSON.stringify({
      title,
      body,
      url: `/b/${business.slug}`,
      tag: `waitlist-${businessId}`,
      icon: notificationIconForTheme(business.storeTheme),
    });

    await Promise.allSettled(
      subs.map(async (sub) => {
        const keys = keysByEndpoint.get(sub.endpoint);
        if (!keys) return;
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: keys.p256dh, auth: keys.auth },
            },
            payload
          );
        } catch (e: unknown) {
          const status = (e as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) {
            await prisma.appointmentWaitlistSubscription
              .delete({ where: { id: sub.id } })
              .catch(() => undefined);
          }
        }
      })
    );
  } catch (e) {
    console.error("[customer-push] appointment-waitlist", e);
  }
}

export async function notifyCustomersBroadcast(
  businessId: string,
  message: string,
  business: { name: string; slug: string; storeLocale: string; storeTheme?: string | null }
) {
  if (!isPushConfigured()) {
    console.warn("[customer-push] skipped: VAPID not configured on server");
    return;
  }

  try {
    const subs = await prisma.customerPushSubscription.findMany({
      where: { businessId },
    });
    if (subs.length === 0) return;

    configureWebPush();
    const preview = message.length > 120 ? `${message.slice(0, 117)}…` : message;
    const title =
      business.storeLocale === "en" ? `Message from ${business.name}` : `הודעה מ${business.name}`;
    const payload = JSON.stringify({
      title,
      body: preview,
      url: `/b/${business.slug}`,
      tag: `broadcast-${businessId}`,
      icon: notificationIconForTheme(business.storeTheme),
    });

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );
        } catch (e: unknown) {
          const status = (e as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) {
            await prisma.customerPushSubscription
              .delete({ where: { id: sub.id } })
              .catch(() => undefined);
          }
        }
      })
    );
  } catch (e) {
    console.error("[customer-push] broadcast", e);
  }
}
