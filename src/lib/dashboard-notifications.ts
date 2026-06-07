import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/low-stock-threshold";
import { buildSellerChatThreads } from "@/lib/seller-chat-threads";
import type { DashboardLabels } from "@/lib/dashboard-messages";
import type { DashboardNotification } from "@/lib/dashboard-notifications-client";

export type {
  DashboardNotification,
  DashboardNotificationKind,
} from "@/lib/dashboard-notifications-client";

function sortNotifications(items: DashboardNotification[]) {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function fetchDashboardNotifications(
  businessId: string,
  labels: DashboardLabels
): Promise<DashboardNotification[]> {
  const [inquiries, chatRows, orders, products] = await Promise.all([
    prisma.inquiry.findMany({
      where: { businessId, sellerReply: null },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.storeChatMessage.findMany({
      where: { businessId, channel: "SELLER" },
      orderBy: { createdAt: "desc" },
      take: 500,
    }),
    prisma.order.findMany({
      where: { businessId, status: "PENDING" },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.product.findMany({
      where: {
        businessId,
        isActive: true,
        stock: { not: null, lte: LOW_STOCK_THRESHOLD },
      },
      orderBy: { name: "asc" },
      take: 20,
    }),
  ]);

  const items: DashboardNotification[] = [];
  const threads = buildSellerChatThreads(chatRows);

  for (const row of inquiries) {
    items.push({
      id: `inquiry:${row.id}`,
      kind: "inquiry",
      title: labels.notificationTypeInquiry,
      subtitle: row.customerName,
      createdAt: row.createdAt.toISOString(),
      inquiryId: row.id,
      customerName: row.customerName,
      customerPhone: row.customerPhone,
      message: row.message,
    });
  }

  for (const thread of threads.filter((t) => t.unreadFromCustomer)) {
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

  for (const order of orders) {
    const total = order.items.reduce(
      (sum, line) => sum + line.priceAtOrder * line.quantity,
      0
    );
    items.push({
      id: `order:${order.id}`,
      kind: "new_order",
      title: labels.notificationTypeOrder,
      subtitle: order.customerName,
      createdAt: order.createdAt.toISOString(),
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      message: `₪${total.toFixed(0)}`,
    });
  }

  for (const product of products) {
    const stock = product.stock ?? 0;
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
        stock <= 0
          ? labels.notificationStockOut
          : labels.notificationStockLeft.replace("{n}", String(stock)),
    });
  }

  return sortNotifications(items);
}
