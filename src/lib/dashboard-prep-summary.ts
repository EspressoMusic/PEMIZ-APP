import type { DashboardOrderView } from "@/components/dashboard/dashboard-order-card";
import type { AppLocale } from "@/lib/app-locale";
import { getDashboardLabels } from "@/lib/app-locale";
import { prisma } from "@/lib/prisma";

export type PrepOrderLine = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  quantity: number;
  status: string;
  createdAt: string;
};

export type PrepProductSummary = {
  productId: string;
  name: string;
  imageUrl: string | null;
  totalQuantity: number;
  orders: PrepOrderLine[];
};

/** מקבץ שורות הזמנה לאותו לקוח (לפי טלפון) לתצוגת פירוט */
export type PrepCustomerGroup = {
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  totalQuantity: number;
  notes: string[];
  orderCount: number;
};

export function groupPrepLinesByCustomer(
  lines: PrepOrderLine[]
): PrepCustomerGroup[] {
  const map = new Map<string, PrepCustomerGroup>();

  for (const line of lines) {
    const phoneKey = line.customerPhone.replace(/\D/g, "");
    const key = phoneKey.length >= 9 ? phoneKey : `${line.customerName}-${line.orderId}`;

    let group = map.get(key);
    if (!group) {
      group = {
        customerName: line.customerName,
        customerPhone: line.customerPhone,
        customerEmail: line.customerEmail,
        totalQuantity: 0,
        notes: [],
        orderCount: 0,
      };
      map.set(key, group);
    }

    group.totalQuantity += line.quantity;
    group.orderCount += 1;
    if (line.notes && !group.notes.includes(line.notes)) {
      group.notes.push(line.notes);
    }
    if (line.customerEmail && !group.customerEmail) {
      group.customerEmail = line.customerEmail;
    }
  }

  return [...map.values()].sort((a, b) => b.totalQuantity - a.totalQuantity);
}

const PREP_STATUSES = ["PENDING"] as const;

export async function getPrepSummaryForBusiness(
  businessId: string
): Promise<PrepProductSummary[]> {
  const orders = await prisma.order.findMany({
    where: {
      businessId,
      status: { in: [...PREP_STATUSES] },
    },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const byProduct = new Map<string, PrepProductSummary>();

  for (const order of orders) {
    for (const item of order.items) {
      const pid = item.productId;
      let row = byProduct.get(pid);
      if (!row) {
        row = {
          productId: pid,
          name: item.product.name,
          imageUrl: item.product.imageUrl,
          totalQuantity: 0,
          orders: [],
        };
        byProduct.set(pid, row);
      }
      row.totalQuantity += item.quantity;
      row.orders.push({
        orderId: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        notes: order.notes,
        quantity: item.quantity,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      });
    }
  }

  return [...byProduct.values()].sort(
    (a, b) => b.totalQuantity - a.totalQuantity
  );
}

export type PendingOrderRecord = {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  createdAt: string | Date;
  items: {
    quantity: number;
    priceAtOrder: number;
    product: { name: string; imageUrl: string | null };
  }[];
};

export async function getPendingOrdersForBusiness(
  businessId: string
): Promise<PendingOrderRecord[]> {
  return prisma.order.findMany({
    where: {
      businessId,
      status: { in: [...PREP_STATUSES] },
    },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function mapPendingOrdersFromRecords(
  records: PendingOrderRecord[],
  locale: AppLocale
): DashboardOrderView[] {
  const labels = getDashboardLabels(locale);
  const statusMap: Record<string, string> = {
    PENDING: labels.pending,
    CONFIRMED: labels.confirmed,
    COMPLETED: labels.completed,
    CANCELLED: labels.cancelled,
  };
  return records.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    status: o.status,
    statusLabel: statusMap[o.status] ?? o.status,
    createdAt:
      typeof o.createdAt === "string"
        ? o.createdAt
        : o.createdAt.toISOString(),
    items: o.items.map((it) => ({
      name: it.product.name,
      quantity: it.quantity,
      lineTotal: it.priceAtOrder * it.quantity,
      imageUrl: it.product.imageUrl,
    })),
  }));
}

export function demoPrepSummary(): PrepProductSummary[] {
  return [
    {
      productId: "demo-yummy",
      name: "יאמי",
      imageUrl: null,
      totalQuantity: 10,
      orders: [
        {
          orderId: "o0a",
          customerName: "דני כהן",
          customerPhone: "050-1111111",
          customerEmail: null,
          notes: null,
          quantity: 5,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
        {
          orderId: "o0b",
          customerName: "שרה לוי",
          customerPhone: "052-2222222",
          customerEmail: "sara@example.com",
          notes: "ללא סוכר",
          quantity: 5,
          status: "CONFIRMED",
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      productId: "demo-croissant",
      name: "קרואסון",
      imageUrl: null,
      totalQuantity: 12,
      orders: [
        {
          orderId: "o1",
          customerName: "דני כהן",
          customerPhone: "050-1234567",
          customerEmail: "dani@example.com",
          notes: "בלי חמאה",
          quantity: 4,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
        {
          orderId: "o2",
          customerName: "שרה לוי",
          customerPhone: "052-9876543",
          customerEmail: null,
          notes: null,
          quantity: 8,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      productId: "demo-cake",
      name: "עוגת שוקולד",
      imageUrl: null,
      totalQuantity: 2,
      orders: [
        {
          orderId: "o3",
          customerName: "יוסי",
          customerPhone: "054-1112233",
          customerEmail: null,
          notes: "לאיסוף ב-18:00",
          quantity: 2,
          status: "CONFIRMED",
          createdAt: new Date().toISOString(),
        },
      ],
    },
  ];
}
