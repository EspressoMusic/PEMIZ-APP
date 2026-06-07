import {
  DEV_PREVIEW_INQUIRIES,
  DEV_PREVIEW_ORDERS,
  DEV_PREVIEW_PRODUCTS,
  DEV_PREVIEW_SELLER_THREADS,
} from "@/lib/dev-preview-data";
import type { DashboardLabels } from "@/lib/dashboard-messages";
import { LOW_STOCK_THRESHOLD } from "@/lib/low-stock-threshold";

export type DashboardNotificationKind =
  | "inquiry"
  | "chat"
  | "new_order"
  | "low_stock";

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
