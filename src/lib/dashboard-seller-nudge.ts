import type { DashboardLabels } from "@/lib/dashboard-messages";
import type { DashboardNotification } from "@/lib/dashboard-notifications-client";

function countByKind(
  notifications: DashboardNotification[],
  kind: DashboardNotification["kind"]
) {
  return notifications.filter((n) => n.kind === kind).length;
}

/** One short friendly line for the home greeting — highest priority wins. */
export function pickSellerNudgeMessage(
  notifications: DashboardNotification[],
  labels: DashboardLabels
): string | null {
  const inquiries = countByKind(notifications, "inquiry");
  const chats = countByKind(notifications, "chat");
  const orders = countByKind(notifications, "new_order");
  const appointments = countByKind(notifications, "new_appointment");
  const lowStock = countByKind(notifications, "low_stock");

  if (inquiries >= 3) return labels.sellerNudgeManyInquiries;
  if (inquiries >= 1) return labels.sellerNudgeInquiry;
  if (orders >= 2) return labels.sellerNudgeManyOrders;
  if (orders >= 1) return labels.sellerNudgeOrder;
  if (chats >= 2) return labels.sellerNudgeManyChats;
  if (chats >= 1) return labels.sellerNudgeChat;
  if (appointments >= 2) return labels.sellerNudgeManyAppointments;
  if (appointments >= 1) return labels.sellerNudgeAppointment;
  if (lowStock >= 1) return labels.sellerNudgeLowStock;
  return null;
}

export function resolveSellerNudgeMessage(
  notifications: DashboardNotification[],
  labels: DashboardLabels,
  options?: { previewDemo?: boolean }
): string | null {
  return (
    pickSellerNudgeMessage(notifications, labels) ??
    (options?.previewDemo ? labels.sellerNudgePreviewDemo : null)
  );
}
