import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/low-stock-threshold";

export { LOW_STOCK_THRESHOLD };

export type SellerPushKind =
  | "new_order"
  | "new_appointment"
  | "inquiry"
  | "chat"
  | "low_stock";

export type SellerPushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

export function isPushConfigured(): boolean {
  return Boolean(
    getVapidPublicKey() &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT
  );
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}

function normalizeVapidSubject(subject: string): string {
  if (subject.startsWith("mailto:") || subject.startsWith("https://")) {
    return subject;
  }
  if (subject.includes("@")) return `mailto:${subject}`;
  return subject;
}

function configureWebPush() {
  const publicKey = getVapidPublicKey();
  if (!publicKey || !process.env.VAPID_PRIVATE_KEY) return;

  webpush.setVapidDetails(
    normalizeVapidSubject(
      process.env.VAPID_SUBJECT ?? "mailto:admin@linky.local"
    ),
    publicKey,
    process.env.VAPID_PRIVATE_KEY
  );
}

async function ownerForPush(
  businessId: string,
  kind: SellerPushKind
): Promise<string | null> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: {
      ownerId: true,
      sellerAlertsEnabled: true,
      sellerAlertOnInquiry: true,
      sellerAlertOnChat: true,
      sellerAlertOnNewOrder: true,
      sellerAlertOnLowStock: true,
    },
  });
  if (!business?.sellerAlertsEnabled) return null;

  const enabled =
    kind === "new_order" || kind === "new_appointment"
      ? business.sellerAlertOnNewOrder
      : kind === "inquiry"
        ? business.sellerAlertOnInquiry
        : kind === "chat"
          ? business.sellerAlertOnChat
          : business.sellerAlertOnLowStock;

  return enabled ? business.ownerId : null;
}

export async function dispatchSellerPush(
  businessId: string,
  kind: SellerPushKind,
  notification: SellerPushPayload
) {
  if (!isPushConfigured()) {
    console.warn("[seller-push] skipped: VAPID not configured on server");
    return;
  }

  try {
    const ownerId = await ownerForPush(businessId, kind);
    if (!ownerId) {
      console.warn("[seller-push] skipped: alerts disabled", { businessId, kind });
      return;
    }

    const subs = await prisma.sellerPushSubscription.findMany({
      where: { userId: ownerId },
    });
    if (subs.length === 0) {
      console.warn("[seller-push] skipped: no device subscriptions", { ownerId });
      return;
    }

    configureWebPush();
    const payload = JSON.stringify(notification);

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
            await prisma.sellerPushSubscription
              .delete({ where: { id: sub.id } })
              .catch(() => undefined);
          }
        }
      })
    );
  } catch (e) {
    console.error("[seller-push]", kind, e);
  }
}

export function fireSellerPush(
  businessId: string,
  kind: SellerPushKind,
  notification: SellerPushPayload
) {
  return dispatchSellerPush(businessId, kind, notification);
}

/** Platform trial warnings — always sent, not gated by seller alert toggles. */
export async function dispatchOwnerPush(
  ownerId: string,
  notification: SellerPushPayload
) {
  if (!isPushConfigured()) return;

  try {
    const subs = await prisma.sellerPushSubscription.findMany({
      where: { userId: ownerId },
    });
    if (subs.length === 0) return;

    configureWebPush();
    const payload = JSON.stringify(notification);

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
            await prisma.sellerPushSubscription
              .delete({ where: { id: sub.id } })
              .catch(() => undefined);
          }
        }
      })
    );
  } catch (e) {
    console.error("[seller-push] owner", e);
  }
}

export async function notifySellerNewOrder(
  businessId: string,
  order: { id: string; customerName: string; total?: number }
) {
  const total =
    order.total != null
      ? ` · ₪${Math.round(order.total)}`
      : "";
  fireSellerPush(businessId, "new_order", {
    title: "הזמנה חדשה",
    body: `${order.customerName}${total}`,
    url: "/dashboard/orders",
    tag: `order-${order.id}`,
  });
}

export async function notifySellerNewAppointment(
  businessId: string,
  appointment: {
    id: string;
    customerName: string;
    serviceName?: string;
    slotStartAt: Date | string;
  }
) {
  const start =
    appointment.slotStartAt instanceof Date
      ? appointment.slotStartAt
      : new Date(appointment.slotStartAt);
  const timeLabel = start.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateLabel = start.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "numeric",
  });
  const service = appointment.serviceName?.trim();
  const detail = service
    ? `${service} · ${dateLabel} ${timeLabel}`
    : `${dateLabel} ${timeLabel}`;

  await fireSellerPush(businessId, "new_appointment", {
    title: "תור חדש",
    body: `${appointment.customerName} · ${detail}`,
    url: "/dashboard",
    tag: `appointment-${appointment.id}`,
  });
}

export async function notifySellerInquiry(
  businessId: string,
  inquiry: { id: string; customerName: string; subject: string }
) {
  fireSellerPush(businessId, "inquiry", {
    title: "פניית לקוח חדשה",
    body: `${inquiry.customerName}: ${inquiry.subject}`,
    url: "/dashboard/customers/inquiries",
    tag: `inquiry-${inquiry.id}`,
  });
}

export async function notifySellerChat(
  businessId: string,
  message: { id: string; customerName: string; body: string }
) {
  const preview =
    message.body.length > 80 ? `${message.body.slice(0, 77)}…` : message.body;
  fireSellerPush(businessId, "chat", {
    title: `צ'אט — ${message.customerName}`,
    body: preview,
    url: "/dashboard/customers/chat",
    tag: `chat-${message.id}`,
  });
}

export async function notifyLowStockAfterOrder(
  businessId: string,
  lines: { productId: string; quantity: number }[]
) {
  for (const line of lines) {
    const product = await prisma.product.findUnique({
      where: { id: line.productId },
      select: { name: true, stock: true },
    });
    if (product?.stock == null) continue;

    const now = product.stock;
    const before = now + line.quantity;
    const crossedLow =
      before > LOW_STOCK_THRESHOLD && now <= LOW_STOCK_THRESHOLD;
    const crossedOut = before > 0 && now <= 0;
    if (!crossedLow && !crossedOut) continue;

    const body =
      now <= 0
        ? `${product.name} — אזל מהמלאי`
        : `${product.name} — נשארו ${now}`;

    fireSellerPush(businessId, "low_stock", {
      title: "מלאי נמוך",
      body,
      url: "/dashboard/settings/products",
      tag: `low-stock-${line.productId}`,
    });
  }
}
