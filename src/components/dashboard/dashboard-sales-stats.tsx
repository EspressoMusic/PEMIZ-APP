"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import { Alert } from "@/components/ui";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";
import { DashboardLineChart } from "@/components/dashboard/dashboard-line-chart";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { formatRevenueTrend } from "@/lib/dashboard-messages";
import {
  demoSalesStats,
  getSalesStatsPeriodMeta,
  type SalesStatsPeriod,
} from "@/lib/sales-stats";

type StatsPayload = {
  points: { label: string; value: number }[];
  totalRevenue: number;
  totalProfit: number;
  totalSalesCount: number;
  priorRevenue: number;
  priorProfit: number;
};

const PERIODS: SalesStatsPeriod[] = ["week", "month", "year"];

function profitRecordKey(businessId: string, period: SalesStatsPeriod) {
  return `linky-profit-record-${businessId}-${period}`;
}

const DEMO_CSV_HEADER = [
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
  'סה"כ הזמנה',
  "סטטוס",
];

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Sample rows so the demo dashboard can show the exact export format without a logged-in business. */
function buildDemoSalesCsv(): string {
  const demoOrders: {
    num: number;
    daysAgo: number;
    name: string;
    phone: string;
    items: [string, number, number][];
  }[] = [
    {
      num: 1042,
      daysAgo: 0,
      name: "נועה כהן",
      phone: "050-1234567",
      items: [
        ["עוגת שוקולד", 2, 85],
        ["לחם מחמצת", 1, 32],
      ],
    },
    {
      num: 1041,
      daysAgo: 1,
      name: "יוסי לוי",
      phone: "052-9876543",
      items: [["קרואסון חמאה", 4, 14]],
    },
    {
      num: 1040,
      daysAgo: 3,
      name: "מיכל אברהם",
      phone: "054-2223344",
      items: [["עוגת גבינה", 1, 120]],
    },
  ];

  const rows = [DEMO_CSV_HEADER.map(csvCell).join(",")];
  const now = new Date();
  for (const order of demoOrders) {
    const date = new Date(now);
    date.setDate(date.getDate() - order.daysAgo);
    const dateStr = date.toLocaleDateString("he-IL");
    const timeStr = date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const orderTotal = order.items.reduce((sum, [, qty, price]) => sum + qty * price, 0);
    for (const [productName, qty, price] of order.items) {
      rows.push(
        [
          String(order.num),
          dateStr,
          timeStr,
          order.name,
          order.phone,
          "",
          productName,
          String(qty),
          price.toFixed(2),
          (qty * price).toFixed(2),
          orderTotal.toFixed(2),
          "הושלם",
        ]
          .map(csvCell)
          .join(",")
      );
    }
  }
  return "\uFEFF" + rows.join("\r\n");
}

function downloadDemoSalesCsv(period: SalesStatsPeriod) {
  const blob = new Blob([buildDemoSalesCsv()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sales-orders-demo-${period}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function DashboardSalesStats({
  backHref,
  previewOnly = false,
  initialPeriod = "week",
  businessId: businessIdProp,
}: {
  backHref: string;
  previewOnly?: boolean;
  initialPeriod?: SalesStatsPeriod;
  businessId?: string;
}) {
  const { locale, labels, formatMoney } = useAppLocale();
  const [period, setPeriod] = useState<SalesStatsPeriod>(initialPeriod);
  const [stats, setStats] = useState<StatsPayload>(() => {
    const demo = demoSalesStats(initialPeriod, locale);
    return { ...demo, priorRevenue: demo.totalRevenue * 0.85, priorProfit: demo.totalProfit * 0.85 };
  });
  const [businessId, setBusinessId] = useState(businessIdProp ?? "preview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confetti, setConfetti] = useState(false);
  const confettiShown = useRef(false);

  const load = useCallback(
    async (p: SalesStatsPeriod) => {
      if (previewOnly) {
        const demo = demoSalesStats(p, locale);
        setStats({
          ...demo,
          priorRevenue: Math.round(demo.totalRevenue * 0.82),
          priorProfit: Math.round(demo.totalProfit * 0.82),
        });
        return;
      }
      setLoading(true);
      setError("");
      const res = await fetch(`/api/dashboard/stats/sales?period=${p}`);
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError((data as { error?: string }).error ?? labels.loadError);
        return;
      }
      const payload: StatsPayload = {
        points: data.points,
        totalRevenue: data.totalRevenue,
        totalProfit: data.totalProfit,
        totalSalesCount: data.totalSalesCount,
        priorRevenue: data.priorRevenue ?? 0,
        priorProfit: data.priorProfit ?? 0,
      };
      setStats(payload);
      if (data.businessId) setBusinessId(data.businessId);

      const key = profitRecordKey(data.businessId ?? businessId, p);
      const prevPeak = Number(
        typeof window !== "undefined" ? localStorage.getItem(key) ?? "0" : "0"
      );
      const profit = payload.totalProfit;
      if (profit > prevPeak && profit > 0) {
        if (prevPeak > 0 && !confettiShown.current) {
          confettiShown.current = true;
          setConfetti(true);
          window.setTimeout(() => setConfetti(false), 4200);
        }
        localStorage.setItem(key, String(profit));
      }
    },
    [previewOnly, locale, labels.loadError, businessId]
  );

  useEffect(() => {
    confettiShown.current = false;
    load(period);
  }, [period, load]);

  const periodMeta = getSalesStatsPeriodMeta(period, locale);
  const revenueTrend = formatRevenueTrend(
    stats.totalRevenue,
    stats.priorRevenue,
    labels
  );

  const currencySymbol = locale === "he" ? "₪" : "$";
  const formatAxisMoney = (v: number) => {
    if (v >= 1_000_000) {
      const m = v / 1_000_000;
      return Number.isInteger(m)
        ? `${currencySymbol}${m}M`
        : `${currencySymbol}${m.toFixed(1)}M`;
    }
    if (v >= 1000) {
      const k = v / 1000;
      return Number.isInteger(k)
        ? `${currencySymbol}${k}K`
        : `${currencySymbol}${k.toFixed(1)}K`;
    }
    return formatMoney(v).replace(/\.00$/, "");
  };

  return (
    <>
      <DashboardConfettiBackground active={confetti} />

      <div className="relative space-y-4 pb-2 text-center">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-[14px] font-bold text-bakery-primary"
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          {labels.backToActions}
        </Link>

        <div className="flex flex-wrap justify-center gap-2">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-full px-4 py-2 text-[14px] font-extrabold transition ${
                period === p
                  ? "bg-bakery-primary/15 text-bakery-primary ring-2 ring-bakery-primary/30"
                  : "border border-bakery-border/35 bg-bakery-input/80 text-bakery-ink"
              }`}
            >
              {getSalesStatsPeriodMeta(p, locale).label}
            </button>
          ))}
        </div>

        <p className="text-[13px] font-semibold text-bakery-muted">
          {periodMeta.summaryLabel}
        </p>

        <a
          href={previewOnly ? "#" : `/api/dashboard/orders/export?period=${period}`}
          onClick={
            previewOnly
              ? (e) => {
                  e.preventDefault();
                  downloadDemoSalesCsv(period);
                }
              : undefined
          }
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-bakery-primary underline-offset-2 hover:underline"
          title={labels.downloadSalesReportHint}
        >
          <Download className="h-4 w-4" />
          {labels.downloadSalesReport}
        </a>

        {error && <Alert variant="error">{error}</Alert>}

        <div className={loading ? "pointer-events-none opacity-60" : ""}>
          <DashboardLineChart
            points={stats.points}
            compact={period === "month"}
            title={labels.salesChartTitle}
            formatValue={formatAxisMoney}
            formatTooltipValue={(v) => formatMoney(v)}
            summary={{
              metricLabel: labels.revenue,
              metricValue: formatMoney(stats.totalRevenue),
              trendText: revenueTrend,
              trendDirection:
                stats.priorRevenue <= 0
                  ? "neutral"
                  : stats.totalRevenue > stats.priorRevenue
                    ? "up"
                    : stats.totalRevenue < stats.priorRevenue
                      ? "down"
                      : "neutral",
            }}
          />
        </div>
      </div>
    </>
  );
}
