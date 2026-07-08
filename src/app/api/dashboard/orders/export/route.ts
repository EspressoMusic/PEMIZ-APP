import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { salesStatsRangeStart, type SalesStatsPeriod } from "@/lib/sales-stats";

const periodSchema = z.enum(["week", "month", "year", "all"]);

const STATUS_LABELS_HE: Record<string, string> = {
  PENDING: "ממתין",
  CONFIRMED: "אושר",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
};

function csvCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const url = new URL(req.url);
  const parsed = periodSchema.safeParse(url.searchParams.get("period") ?? "all");
  const period = parsed.success ? parsed.data : "all";
  const since = period === "all" ? undefined : salesStatsRangeStart(period as SalesStatsPeriod);

  const orders = await prisma.order.findMany({
    where: {
      businessId: ctx.user.business.id,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "asc" },
  });

  const header = [
    "מספר הזמנה",
    "תאריך",
    "שעה",
    "שם לקוח",
    "טלפון",
    "אימייל",
    "מוצר",
    "כמות",
    "מחיר ליחידה",
    'סה"כ שורה',
    "קוד קופון",
    "הנחה",
    'סה"כ הזמנה',
    "סטטוס",
  ];

  const rows: string[] = [header.map(csvCell).join(",")];

  for (const order of orders) {
    const grossTotal = order.items.reduce(
      (sum, item) => sum + item.priceAtOrder * item.quantity,
      0
    );
    const orderTotal = grossTotal - order.discountAmount;
    const dateStr = order.createdAt.toLocaleDateString("he-IL");
    const timeStr = order.createdAt.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const statusLabel = STATUS_LABELS_HE[order.status] ?? order.status;
    const baseCells = [
      String(order.orderNumber),
      dateStr,
      timeStr,
      order.customerName,
      order.customerPhone,
      order.customerEmail ?? "",
    ];
    const couponCell = order.couponCode ?? "";
    const discountCell = order.discountAmount > 0 ? order.discountAmount.toFixed(2) : "";

    if (order.items.length === 0) {
      rows.push(
        [
          ...baseCells,
          "",
          "",
          "",
          couponCell,
          discountCell,
          orderTotal.toFixed(2),
          statusLabel,
        ]
          .map(csvCell)
          .join(",")
      );
      continue;
    }

    for (const item of order.items) {
      rows.push(
        [
          ...baseCells,
          item.product.name,
          String(item.quantity),
          item.priceAtOrder.toFixed(2),
          (item.priceAtOrder * item.quantity).toFixed(2),
          couponCell,
          discountCell,
          orderTotal.toFixed(2),
          statusLabel,
        ]
          .map(csvCell)
          .join(",")
      );
    }
  }

  // Leading BOM so Excel opens the Hebrew text as UTF-8 instead of mangling it.
  const csv = "\uFEFF" + rows.join("\r\n");
  const filename = `sales-orders-${ctx.user.business.slug}-${period}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
