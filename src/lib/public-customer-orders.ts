import type { CustomerOrderHistoryEntry } from "@/lib/customer-order-history";

type OrderRow = {
  id: string;
  orderNumber: number;
  status: string;
  createdAt: Date;
  items: {
    quantity: number;
    priceAtOrder: number;
    product: { name: string; imageUrl: string | null };
  }[];
};

export function mapPublicOrdersToHistory(
  orders: OrderRow[],
  statusLabel: (status: string) => string
): CustomerOrderHistoryEntry[] {
  return orders.map((order) => ({
    id: order.id,
    placedAt: order.createdAt.toISOString(),
    orderNumber: order.orderNumber,
    statusLabel: statusLabel(order.status),
    total: order.items.reduce(
      (sum, item) => sum + item.priceAtOrder * item.quantity,
      0
    ),
    lines: order.items.map((item) => ({
      name: item.product.name,
      imageUrl: item.product.imageUrl,
      qty: item.quantity,
      lineTotal: item.priceAtOrder * item.quantity,
      productId: undefined,
    })),
  }));
}
