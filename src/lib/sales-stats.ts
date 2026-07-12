import type { AppLocale } from "@/lib/app-locale";
import { getDashboardLabels } from "@/lib/app-locale";

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

export function buildSalesStatsBuckets(
  period: SalesStatsPeriod,
  locale: AppLocale = "en"
): SalesStatsBucket[] {
  const now = new Date();
  const dateLocale = locale === "en" ? "en-US" : "he-IL";

  if (period === "week") {
    const buckets: SalesStatsBucket[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = startOfDay(now);
      d.setDate(d.getDate() - i);
      buckets.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString(dateLocale, { weekday: "short" }),
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
        label: d.toLocaleDateString(dateLocale, { day: "numeric", month: "numeric" }),
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
      label: d.toLocaleDateString(dateLocale, { month: "short" }),
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

/** The period immediately before the current window (for trend comparison) */
export function salesStatsPriorRange(period: SalesStatsPeriod): {
  start: Date;
  end: Date;
} {
  const currentStart = salesStatsRangeStart(period);
  const end = new Date(currentStart.getTime() - 1);
  const start = startOfDay(new Date(currentStart));
  if (period === "week") {
    start.setDate(start.getDate() - 7);
  } else if (period === "month") {
    start.setDate(start.getDate() - 30);
  } else {
    start.setMonth(start.getMonth() - 12);
    start.setDate(1);
  }
  return { start, end };
}

export function sumOrderTotals(orders: OrderForStats[]): {
  totalRevenue: number;
  totalProfit: number;
  totalSalesCount: number;
} {
  let totalRevenue = 0;
  let totalSalesCount = 0;
  for (const order of orders) {
    if (order.status === "CANCELLED") continue;
    totalRevenue += orderRevenue(order);
    totalSalesCount += 1;
  }
  const rounded = Math.round(totalRevenue * 100) / 100;
  return {
    totalRevenue: rounded,
    totalProfit: rounded,
    totalSalesCount,
  };
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
  period: SalesStatsPeriod,
  locale: AppLocale = "en"
): {
  points: SalesStatsPoint[];
  totalRevenue: number;
  totalProfit: number;
  totalSalesCount: number;
} {
  const buckets = buildSalesStatsBuckets(period, locale);
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
    if (idx >= 0) points[idx].value += revenue;
  }

  return {
    points,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProfit: Math.round(totalRevenue * 100) / 100,
    totalSalesCount,
  };
}

export function getSalesStatsPeriodMeta(period: SalesStatsPeriod, locale: AppLocale) {
  const L = getDashboardLabels(locale);
  const map: Record<
    SalesStatsPeriod,
    { id: SalesStatsPeriod; label: string; summaryLabel: string }
  > = {
    week: { id: "week", label: L.periodWeek, summaryLabel: L.periodSummaryWeek },
    month: { id: "month", label: L.periodMonth, summaryLabel: L.periodSummaryMonth },
    year: { id: "year", label: L.periodYear, summaryLabel: L.periodSummaryYear },
  };
  return map[period];
}

export function demoSalesStats(period: SalesStatsPeriod, locale: AppLocale = "en") {
  const buckets = buildSalesStatsBuckets(period, locale);
  const demoCounts =
    period === "year"
      ? [8, 12, 9, 14, 11, 16, 13, 18, 15, 20, 17, 22]
      : period === "month"
        ? Array.from({ length: 30 }, (_, i) => 1 + (i % 5))
        : [2, 5, 3, 7, 4, 9, 6];

  const points = buckets.map((b, i) => ({
    label: b.label,
    value: (demoCounts[i] ?? 0) * 127.5,
  }));
  const totalSalesCount = demoCounts.reduce((s, n) => s + n, 0);
  const totalRevenue = points.reduce((s, p) => s + p.value, 0);
  const rounded = Math.round(totalRevenue * 100) / 100;

  return {
    points,
    totalRevenue: rounded,
    totalProfit: rounded,
    totalSalesCount,
  };
}
