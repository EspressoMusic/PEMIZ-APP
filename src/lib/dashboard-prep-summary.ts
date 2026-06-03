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

const PREP_STATUSES = ["PENDING", "CONFIRMED"] as const;

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

export function demoPrepSummary(): PrepProductSummary[] {
  return [
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
