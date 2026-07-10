import {
  DEV_APPOINTMENTS_PREVIEW_INQUIRIES,
  DEV_APPOINTMENTS_PREVIEW_SELLER_THREADS,
  DEV_PREVIEW_INQUIRIES,
  DEV_PREVIEW_ORDERS,
  DEV_PREVIEW_PRODUCTS,
  DEV_PREVIEW_SELLER_THREADS,
  DEV_RENTAL_PREVIEW_INQUIRIES,
  DEV_RENTAL_PREVIEW_SELLER_THREADS,
  getDevPreviewAppointmentsSeller,
  getDevPreviewRentalSeller,
} from "@/lib/dev-preview-data";
import { parseServiceFromNotes } from "@/lib/customer-appointment-history";
import { getDashboardLabels } from "@/lib/app-locale";
import type { DashboardLabels } from "@/lib/dashboard-messages";
import { LOW_STOCK_THRESHOLD } from "@/lib/low-stock-threshold";

export type DashboardNotificationKind =
  | "inquiry"
  | "chat"
  | "new_order"
  | "new_appointment"
  | "low_stock";

export type DashboardNotificationOrderItem = {
  name: string;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
};

export type DashboardNotification = {
  id: string;
  kind: DashboardNotificationKind;
  title: string;
  subtitle: string;
  createdAt: string;
  inquiryId?: string;
  customerName?: string;
  customerPhone?: string | null;
  message?: string;
  orderId?: string;
  orderNumber?: number;
  orderItems?: DashboardNotificationOrderItem[];
  appointmentId?: string;
  productId?: string;
  productName?: string;
  stock?: number | null;
};

export function notificationKindLabel(
  kind: DashboardNotificationKind,
  labels: DashboardLabels
): string {
  switch (kind) {
    case "inquiry":
      return labels.notificationTypeInquiry;
    case "chat":
      return labels.notificationTypeChat;
    case "new_order":
      return labels.notificationTypeOrder;
    case "new_appointment":
      return labels.notificationTypeAppointment;
    case "low_stock":
      return labels.notificationTypeLowStock;
    default:
      return labels.alerts;
  }
}

function sortNotifications(items: DashboardNotification[]) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function buildDevDashboardNotifications(
  labels: DashboardLabels
): DashboardNotification[] {
  const items: DashboardNotification[] = [];

  for (const row of DEV_PREVIEW_INQUIRIES.filter((q) => !q.sellerReply)) {
    items.push({
      id: `inquiry:${row.id}`,
      kind: "inquiry",
      title: labels.notificationTypeInquiry,
      subtitle: row.customerName,
      createdAt: row.createdAt,
      inquiryId: row.id,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      message: row.message,
    });
  }

  for (const thread of DEV_PREVIEW_SELLER_THREADS.filter(
    (t) => t.unreadFromCustomer
  )) {
    items.push({
      id: `chat:${thread.customerPhone}`,
      kind: "chat",
      title: labels.notificationTypeChat,
      subtitle: thread.customerName,
      createdAt: thread.lastAt,
      customerName: thread.customerName,
      customerPhone: thread.customerPhone,
      message: thread.lastMessage,
    });
  }

  for (const order of DEV_PREVIEW_ORDERS.filter((o) => o.status === "PENDING")) {
    const total = order.items.reduce((sum, line) => sum + line.lineTotal, 0);
    items.push({
      id: `order:${order.id}`,
      kind: "new_order",
      title: labels.notificationTypeOrder,
      subtitle: order.customerName || labels.anonymousCustomer,
      createdAt: order.createdAt,
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderItems: order.items,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      message: `₪${total.toFixed(0)}`,
    });
  }

  for (const product of DEV_PREVIEW_PRODUCTS.filter(
    (p) => p.isActive && p.stock != null && p.stock <= LOW_STOCK_THRESHOLD
  )) {
    items.push({
      id: `stock:${product.id}`,
      kind: "low_stock",
      title: labels.notificationTypeLowStock,
      subtitle: product.name,
      createdAt: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      stock: product.stock,
      message:
        (product.stock ?? 0) <= 0
          ? labels.notificationStockOut
          : labels.notificationStockLeft.replace("{n}", String(product.stock)),
    });
  }

  return sortNotifications(items);
}

export function buildDevAppointmentsDashboardNotifications(
  labels: DashboardLabels
): DashboardNotification[] {
  const items: DashboardNotification[] = [];

  for (const row of DEV_APPOINTMENTS_PREVIEW_INQUIRIES.filter(
    (q) => !q.sellerReply
  )) {
    items.push({
      id: `inquiry:${row.id}`,
      kind: "inquiry",
      title: labels.notificationTypeInquiry,
      subtitle: row.customerName,
      createdAt: row.createdAt,
      inquiryId: row.id,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      message: row.message,
    });
  }

  for (const thread of DEV_APPOINTMENTS_PREVIEW_SELLER_THREADS.filter(
    (t) => t.unreadFromCustomer
  )) {
    items.push({
      id: `chat:${thread.customerPhone}`,
      kind: "chat",
      title: labels.notificationTypeChat,
      subtitle: thread.customerName,
      createdAt: thread.lastAt,
      customerName: thread.customerName,
      customerPhone: thread.customerPhone,
      message: thread.lastMessage,
    });
  }

  const nowMs = Date.now();
  for (const appt of getDevPreviewAppointmentsSeller()
    .filter(
      (a) =>
        a.status !== "CANCELLED" &&
        new Date(a.slot.startAt).getTime() >= nowMs
    )
    .slice(0, 4)) {
    const service = parseServiceFromNotes(appt.notes);
    const slotStart = new Date(appt.slot.startAt);
    const timeLabel = slotStart.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    items.push({
      id: `appointment:${appt.id}`,
      kind: "new_appointment",
      title: labels.notificationTypeAppointment,
      subtitle: appt.customerName,
      createdAt: appt.slot.startAt,
      appointmentId: appt.id,
      customerName: appt.customerName,
      customerPhone: appt.customerPhone,
      message: service ? `${service} · ${timeLabel}` : timeLabel,
    });
  }

  return sortNotifications(items);
}

export function buildDevRentalDashboardNotifications(
  labels: DashboardLabels
): DashboardNotification[] {
  const items: DashboardNotification[] = [];

  for (const row of DEV_RENTAL_PREVIEW_INQUIRIES.filter((q) => !q.sellerReply)) {
    items.push({
      id: `inquiry:${row.id}`,
      kind: "inquiry",
      title: labels.notificationTypeInquiry,
      subtitle: row.customerName,
      createdAt: row.createdAt,
      inquiryId: row.id,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      message: row.message,
    });
  }

  for (const thread of DEV_RENTAL_PREVIEW_SELLER_THREADS.filter(
    (t) => t.unreadFromCustomer
  )) {
    items.push({
      id: `chat:${thread.customerPhone}`,
      kind: "chat",
      title: labels.notificationTypeChat,
      subtitle: thread.customerName,
      createdAt: thread.lastAt,
      customerName: thread.customerName,
      customerPhone: thread.customerPhone,
      message: thread.lastMessage,
    });
  }

  const nowMs = Date.now();
  for (const appt of getDevPreviewRentalSeller()
    .filter(
      (a) =>
        a.status !== "CANCELLED" &&
        new Date(a.slot.startAt).getTime() >= nowMs
    )
    .slice(0, 4)) {
    const service = parseServiceFromNotes(appt.notes);
    const slotStart = new Date(appt.slot.startAt);
    const timeLabel = slotStart.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "numeric",
    });
    items.push({
      id: `appointment:${appt.id}`,
      kind: "new_appointment",
      title: labels.notificationTypeAppointment,
      subtitle: appt.customerName,
      createdAt: appt.slot.startAt,
      appointmentId: appt.id,
      customerName: appt.customerName,
      customerPhone: appt.customerPhone,
      message: service ? `${service} · ${timeLabel}` : timeLabel,
    });
  }

  return sortNotifications(items);
}

export function isStoreOnlyNotificationKind(
  kind: DashboardNotificationKind
): boolean {
  return kind === "new_order" || kind === "low_stock";
}

export async function loadDashboardNotifications(options: {
  previewOnly: boolean;
  businessType: import("@/lib/types").BusinessType;
  locale: import("@/lib/app-locale").AppLocale;
}): Promise<DashboardNotification[]> {
  const { previewOnly, businessType, locale } = options;
  if (previewOnly) {
    return loadPreviewDashboardNotifications(businessType, locale);
  }
  return fetchLiveDashboardNotifications(businessType);
}

export function loadPreviewDashboardNotifications(
  businessType: import("@/lib/types").BusinessType,
  locale: import("@/lib/app-locale").AppLocale
): DashboardNotification[] {
  const labels = getDashboardLabels(locale);
  if (businessType === "RENTAL") {
    return buildDevRentalDashboardNotifications(labels);
  }
  if (businessType === "APPOINTMENTS") {
    return buildDevAppointmentsDashboardNotifications(labels);
  }
  return buildDevDashboardNotifications(labels);
}

export async function fetchLiveDashboardNotifications(
  businessType: import("@/lib/types").BusinessType
): Promise<DashboardNotification[]> {
  const res = await fetch("/api/dashboard/notifications");
  const data = await res.json();
  if (!res.ok) return [];
  const items: DashboardNotification[] = data.notifications ?? [];
  if (businessType === "APPOINTMENTS" || businessType === "RENTAL") {
    return items.filter((item) => !isStoreOnlyNotificationKind(item.kind));
  }
  return items;
}
