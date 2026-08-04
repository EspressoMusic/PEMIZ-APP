import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { configureWebPush, isPushConfigured } from "@/lib/seller-push";

const PEYMIZ_BRAND_ICON = "/icons/notification-icon.png";

type MasterPushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

async function dispatchMasterPush(notification: MasterPushPayload) {
  if (!isPushConfigured()) {
    console.warn("[master-push] skipped: VAPID not configured on server");
    return;
  }

  try {
    const subs = await prisma.masterPushSubscription.findMany();
    if (subs.length === 0) return;

    configureWebPush();
    const payload = JSON.stringify({ ...notification, icon: PEYMIZ_BRAND_ICON });

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
            await prisma.masterPushSubscription
              .delete({ where: { id: sub.id } })
              .catch(() => undefined);
          } else {
            console.error("[master-push] send failed", {
              subscriptionId: sub.id,
              status,
              message: (e as { message?: string })?.message,
            });
          }
        }
      })
    );
  } catch (e) {
    console.error("[master-push]", e);
  }
}

export function notifyMasterNewSignup(user: { name: string; email: string }) {
  return dispatchMasterPush({
    title: "משתמש חדש נרשם",
    body: `${user.name} · ${user.email}`,
    url: "/dashboard",
    tag: `signup-${user.email}`,
  });
}

export function notifyMasterNewBusiness(
  business: { id: string; name: string },
  owner: { name: string; email: string }
) {
  return dispatchMasterPush({
    title: "עסק חדש הושלם",
    body: `${business.name} · ${owner.name}`,
    url: "/dashboard",
    tag: `business-${business.id}`,
  });
}

export type MasterPushTestResult = {
  totalSubscriptions: number;
  delivered: number;
  expiredRemoved: number;
  failed: number;
};

export async function sendTestPushToMaster(): Promise<MasterPushTestResult> {
  const subs = await prisma.masterPushSubscription.findMany();

  if (subs.length === 0 || !isPushConfigured()) {
    return { totalSubscriptions: subs.length, delivered: 0, expiredRemoved: 0, failed: 0 };
  }

  configureWebPush();
  const payload = JSON.stringify({
    title: "בדיקת התראות",
    body: "אם קיבלת את זה — ההתראות עובדות!",
    url: "/dashboard",
    icon: PEYMIZ_BRAND_ICON,
  });

  let delivered = 0;
  let expiredRemoved = 0;
  let failed = 0;

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        delivered += 1;
      } catch (e: unknown) {
        const status = (e as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await prisma.masterPushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => undefined);
          expiredRemoved += 1;
        } else {
          failed += 1;
          console.error("[master-push] test send failed", {
            subscriptionId: sub.id,
            status,
            message: (e as { message?: string })?.message,
          });
        }
      }
    })
  );

  return { totalSubscriptions: subs.length, delivered, expiredRemoved, failed };
}
