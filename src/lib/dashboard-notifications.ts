import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/low-stock-threshold";
import { parseServiceFromNotes } from "@/lib/customer-appointment-history";
import { buildSellerChatThreads } from "@/lib/seller-chat-threads";
import type { DashboardLabels } from "@/lib/dashboard-messages";
import type { DashboardNotification } from "@/lib/dashboard-notifications-client";
import type { BusinessType } from "@/lib/types";
import { isScheduleLikeBusinessType } from "@/lib/types";

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
  labels: DashboardLabels,
  businessType: BusinessType = "STORE",
  orderConfirmationRequired = true
): Promise<DashboardNotification[]> {
  const isScheduleLike = isScheduleLikeBusinessType(businessType);
  const since = new Date(Date.now() - 72 * 60 * 60 * 1000);

  const [inquiries, chatRows, orders, products, appointments] =
    await Promise.all([
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
      isScheduleLike
        ? Promise.resolve([])
        : prisma.order.findMany({
            where: orderConfirmationRequired
              ? { businessId, status: "PENDING" }
              : { businessId, status: "CONFIRMED", sellerHiddenAt: null },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: "desc" },
            take: 20,
          }),
      isScheduleLike
        ? Promise.resolve([])
        : prisma.product.findMany({
            where: {
              businessId,
              isActive: true,
              stock: { not: null, lte: LOW_STOCK_THRESHOLD },
            },
            orderBy: { name: "asc" },
            take: 20,
          }),
      isScheduleLike
        ? prisma.appointment.findMany({
            where: {
              businessId,
              status: { not: "CANCELLED" },
              sellerHiddenAt: null,
              createdAt: { gte: since },
              slot: { startAt: { gte: new Date() } },
            },
            include: { slot: true },
            orderBy: { createdAt: "desc" },
            take: 20,
          })
        : Promise.resolve([]),
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
    const orderItems = order.items.map((line) => ({
      name: line.product.name,
      quantity: line.quantity,
      lineTotal: line.priceAtOrder * line.quantity,
      imageUrl: line.product.imageUrl,
    }));
    const total = orderItems.reduce((sum, line) => sum + line.lineTotal, 0);
    items.push({
      id: `order:${order.id}`,
      kind: "new_order",
      title: labels.notificationTypeOrder,
      subtitle: order.customerName,
      createdAt: order.createdAt.toISOString(),
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderItems,
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

  for (const appt of appointments) {
    const service = parseServiceFromNotes(appt.notes);
    const slotStart = appt.slot.startAt;
    const timeLabel = slotStart.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    items.push({
      id: `appointment:${appt.id}`,
      kind: "new_appointment",
      title: labels.notificationTypeAppointment,
      subtitle: appt.customerName,
      createdAt: appt.createdAt.toISOString(),
      appointmentId: appt.id,
      customerName: appt.customerName,
      customerPhone: appt.customerPhone,
      message: service ? `${service} · ${timeLabel}` : timeLabel,
    });
  }

  return sortNotifications(items);
}
