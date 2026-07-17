import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { configureWebPush, isPushConfigured } from "@/lib/seller-push";
import { notificationIconForTheme } from "@/lib/store-themes";

export async function notifyCustomerOrderStatus(
  orderId: string,
  status: "CONFIRMED" | "REJECTED",
  business: { name: string; slug: string; storeLocale: string; storeTheme?: string | null }
) {
  if (!isPushConfigured()) return;

  try {
    const subs = await prisma.orderPushSubscription.findMany({
      where: { orderId },
    });
    if (subs.length === 0) return;

    configureWebPush();
    const isHe = business.storeLocale !== "en";
    const title =
      status === "CONFIRMED"
        ? isHe
          ? `ההזמנה שלך אושרה!`
          : "Your order was confirmed!"
        : isHe
          ? "ההזמנה שלך נדחתה"
          : "Your order was declined";
    const body = isHe ? business.name : `From ${business.name}`;
    const payload = JSON.stringify({
      title,
      body,
      url: `/b/${business.slug}`,
      tag: `order-status-${orderId}`,
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
          const statusCode = (e as { statusCode?: number })?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await prisma.orderPushSubscription
              .delete({ where: { id: sub.id } })
              .catch(() => undefined);
          }
        }
      })
    );

    // One-shot "your order was resolved" ping — no need to keep the rows around.
    await prisma.orderPushSubscription
      .deleteMany({ where: { orderId } })
      .catch(() => undefined);
  } catch (e) {
    console.error("[order-push]", e);
  }
}
