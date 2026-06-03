"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Alert, PageTitle } from "@/components/ui";
import { DashboardBarChart } from "@/components/dashboard/dashboard-bar-chart";
import {
  SALES_STATS_PERIOD_LABELS,
  demoSalesStats,
  type SalesStatsPeriod,
} from "@/lib/sales-stats";

type StatsPayload = {
  points: { label: string; value: number }[];
  totalRevenue: number;
  totalProfit: number;
  totalSalesCount: number;
};

const PERIODS: SalesStatsPeriod[] = ["week", "month", "year"];

function formatMoney(n: number) {
  return n.toLocaleString("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function DashboardSalesStats({
  backHref,
  previewOnly = false,
  initialPeriod = "week",
}: {
  backHref: string;
  previewOnly?: boolean;
  initialPeriod?: SalesStatsPeriod;
}) {
  const [period, setPeriod] = useState<SalesStatsPeriod>(initialPeriod);
  const [stats, setStats] = useState<StatsPayload>(() =>
    previewOnly
      ? demoSalesStats(initialPeriod)
      : {
          points: [],
          totalRevenue: 0,
          totalProfit: 0,
          totalSalesCount: 0,
        }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (p: SalesStatsPeriod) => {
    if (previewOnly) {
      setStats(demoSalesStats(p));
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/dashboard/stats/sales?period=${p}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError((data as { error?: string }).error ?? "שגיאה בטעינה");
      return;
    }
    setStats({
      points: data.points,
      totalRevenue: data.totalRevenue,
      totalProfit: data.totalProfit,
      totalSalesCount: data.totalSalesCount,
    });
  }, [previewOnly]);

  useEffect(() => {
    load(period);
  }, [period, load]);

  const periodMeta = SALES_STATS_PERIOD_LABELS[period];

  return (
    <div className="space-y-5 pb-2 text-center">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-[14px] font-bold text-bakery-primary"
      >
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        חזרה לפעולות
      </Link>

      <PageTitle>מכירות ורווחים</PageTitle>

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
            {SALES_STATS_PERIOD_LABELS[p].label}
          </button>
        ))}
      </div>

      <p className="text-[13px] font-semibold text-bakery-muted">
        {periodMeta.summaryLabel}
      </p>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="סך המכירות"
          value={`${formatMoney(stats.totalRevenue)} ₪`}
          hint="סכום הזמנות בתקופה"
        />
        <SummaryCard
          label="סך הרווח"
          value={`${formatMoney(stats.totalProfit)} ₪`}
          hint="הכנסות נטו (ללא הזמנות שבוטלו)"
        />
        <SummaryCard
          label="כמות מכירות"
          value={String(stats.totalSalesCount)}
          hint="מספר הזמנות בתקופה"
        />
      </div>

      <div className={loading ? "opacity-60 pointer-events-none" : ""}>
        <DashboardBarChart
          title="כמות המכירות"
          unit=""
          points={stats.points}
          compact={period === "month"}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[20px] border border-bakery-border/25 bg-bakery-square px-4 py-3 text-center shadow-[0_3px_10px_rgba(58,47,38,0.08)]">
      <p className="text-[13px] font-bold text-bakery-muted">{label}</p>
      <p className="mt-1 text-[22px] font-extrabold text-bakery-ink">{value}</p>
      <p className="mt-1 text-[11px] text-bakery-muted">{hint}</p>
    </div>
  );
}
