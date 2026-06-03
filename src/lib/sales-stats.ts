export type SalesStatsPeriod = "week" | "month" | "year";

export type SalesStatsBucket = {
  key: string;
  label: string;
};

export type SalesStatsPoint = {
  label: string;
  value: number;
};

export type OrderForStats = {
  createdAt: Date;
  status: string;
  items: { priceAtOrder: number; quantity: number }[];
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function buildSalesStatsBuckets(period: SalesStatsPeriod): SalesStatsBucket[] {
  const now = new Date();

  if (period === "week") {
    const buckets: SalesStatsBucket[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = startOfDay(now);
      d.setDate(d.getDate() - i);
      buckets.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("he-IL", { weekday: "short" }),
      });
    }
    return buckets;
  }

  if (period === "month") {
    const buckets: SalesStatsBucket[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = startOfDay(now);
      d.setDate(d.getDate() - i);
      buckets.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" }),
      });
    }
    return buckets;
  }

  const buckets: SalesStatsBucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = startOfDay(now);
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    buckets.push({
      key: monthKey(d),
      label: d.toLocaleDateString("he-IL", { month: "short" }),
    });
  }
  return buckets;
}

export function salesStatsRangeStart(period: SalesStatsPeriod): Date {
  const since = startOfDay(new Date());
  if (period === "week") {
    since.setDate(since.getDate() - 6);
  } else if (period === "month") {
    since.setDate(since.getDate() - 29);
  } else {
    since.setDate(1);
    since.setMonth(since.getMonth() - 11);
  }
  return since;
}

function orderRevenue(order: OrderForStats): number {
  return order.items.reduce(
    (sum, item) => sum + item.priceAtOrder * item.quantity,
    0
  );
}

function bucketKeyForOrder(createdAt: Date, period: SalesStatsPeriod): string {
  const d = new Date(createdAt);
  if (period === "year") return monthKey(d);
  return startOfDay(d).toISOString().slice(0, 10);
}

export function computeSalesStats(
  orders: OrderForStats[],
  period: SalesStatsPeriod
): {
  points: SalesStatsPoint[];
  totalRevenue: number;
  totalProfit: number;
  totalSalesCount: number;
} {
  const buckets = buildSalesStatsBuckets(period);
  const points = buckets.map((b) => ({ label: b.label, value: 0 }));

  let totalRevenue = 0;
  let totalSalesCount = 0;

  for (const order of orders) {
    if (order.status === "CANCELLED") continue;
    const revenue = orderRevenue(order);
    totalRevenue += revenue;
    totalSalesCount += 1;

    const key = bucketKeyForOrder(order.createdAt, period);
    const idx = buckets.findIndex((b) => b.key === key);
    if (idx >= 0) points[idx].value += 1;
  }

  return {
    points,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProfit: Math.round(totalRevenue * 100) / 100,
    totalSalesCount,
  };
}

export const SALES_STATS_PERIOD_LABELS: Record<
  SalesStatsPeriod,
  { id: SalesStatsPeriod; label: string; summaryLabel: string }
> = {
  week: { id: "week", label: "שבועי", summaryLabel: "7 הימים האחרונים" },
  month: { id: "month", label: "חודשי", summaryLabel: "30 הימים האחרונים" },
  year: { id: "year", label: "שנתי", summaryLabel: "12 החודשים האחרונים" },
};

export function demoSalesStats(period: SalesStatsPeriod) {
  const buckets = buildSalesStatsBuckets(period);
  const demoCounts =
    period === "year"
      ? [8, 12, 9, 14, 11, 16, 13, 18, 15, 20, 17, 22]
      : period === "month"
        ? Array.from({ length: 30 }, (_, i) => 1 + (i % 5))
        : [2, 5, 3, 7, 4, 9, 6];

  const points = buckets.map((b, i) => ({
    label: b.label,
    value: demoCounts[i] ?? 0,
  }));
  const totalSalesCount = points.reduce((s, p) => s + p.value, 0);
  const totalRevenue = totalSalesCount * 127.5;
  const rounded = Math.round(totalRevenue);

  return {
    points,
    totalRevenue: rounded,
    totalProfit: rounded,
    totalSalesCount,
  };
}
