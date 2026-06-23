"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Alert, PageTitle } from "@/components/ui";
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

        <PageTitle>{labels.salesAndProfit}</PageTitle>

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
              periodLabel: periodMeta.label,
            }}
          />
        </div>
      </div>
    </>
  );
}
