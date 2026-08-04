"use client";

import { useMemo, useState, type LucideIcon } from "react";
import { Store, TrendingUp } from "lucide-react";
import {
  getSubscriptionPlan,
  parseSubscriptionPlanId,
} from "@/lib/subscription-plans";

type StatsBusiness = {
  createdAt: string;
  subscriptionActiveAt: string | null;
  subscriptionPlan: string | null;
};

type Granularity = "day" | "week" | "month";

const BUCKET_COUNT: Record<Granularity, number> = {
  day: 14,
  week: 8,
  month: 6,
};

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: "day", label: "יום" },
  { value: "week", label: "שבוע" },
  { value: "month", label: "חודש" },
];

type Bucket = {
  start: number;
  end: number;
  label: string;
  fullLabel: string;
};

function buildBuckets(granularity: Granularity, now: Date): Bucket[] {
  const count = BUCKET_COUNT[granularity];
  const buckets: Bucket[] = [];

  if (granularity === "day") {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let i = count - 1; i >= 0; i--) {
      const start = new Date(todayStart);
      start.setDate(start.getDate() - i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      buckets.push({
        start: start.getTime(),
        end: end.getTime(),
        label: start.toLocaleDateString("he-IL", { day: "numeric" }),
        fullLabel: start.toLocaleDateString("he-IL", {
          weekday: "long",
          day: "numeric",
          month: "numeric",
        }),
      });
    }
    return buckets;
  }

  if (granularity === "week") {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let i = count - 1; i >= 0; i--) {
      const end = new Date(todayStart);
      end.setDate(end.getDate() - i * 7 + 1);
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      const lastDay = new Date(end);
      lastDay.setDate(lastDay.getDate() - 1);
      buckets.push({
        start: start.getTime(),
        end: end.getTime(),
        label: start.toLocaleDateString("he-IL", {
          day: "2-digit",
          month: "2-digit",
        }),
        fullLabel: `שבוע ${start.toLocaleDateString("he-IL", {
          day: "numeric",
          month: "numeric",
        })}–${lastDay.toLocaleDateString("he-IL", {
          day: "numeric",
          month: "numeric",
        })}`,
      });
    }
    return buckets;
  }

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(monthStart.getFullYear(), monthStart.getMonth() - i, 1);
    const end = new Date(monthStart.getFullYear(), monthStart.getMonth() - i + 1, 1);
    buckets.push({
      start: start.getTime(),
      end: end.getTime(),
      label: start.toLocaleDateString("he-IL", { month: "short" }),
      fullLabel: start.toLocaleDateString("he-IL", {
        month: "long",
        year: "numeric",
      }),
    });
  }
  return buckets;
}

function subscriptionPriceUsd(b: StatsBusiness): number {
  const planId = parseSubscriptionPlanId(b.subscriptionPlan) ?? "premium";
  return getSubscriptionPlan(planId).priceUsd;
}

type ChartPoint = { label: string; fullLabel: string; value: number };

function MiniBarChart({
  title,
  icon: Icon,
  color,
  points,
  totalLabel,
  formatValue,
}: {
  title: string;
  icon: LucideIcon;
  color: string;
  points: ChartPoint[];
  totalLabel: string;
  formatValue: (n: number) => string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const max = Math.max(1, ...points.map((p) => p.value));
  const total = points.reduce((sum, p) => sum + p.value, 0);
  const lastIndex = points.length - 1;

  return (
    <div className="rounded-[18px] border border-bakery-border/30 bg-bakery-input/50 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-bakery-ink">
          <Icon
            className="h-4 w-4 shrink-0"
            style={{ color }}
            strokeWidth={2.5}
            aria-hidden
          />
          {title}
        </p>
        <p className="text-[11px] font-bold text-bakery-muted">
          {totalLabel} {formatValue(total)}
        </p>
      </div>

      <div className="relative h-[88px] pt-4">
        <span className="absolute end-0 top-0 text-[10px] font-semibold text-bakery-muted">
          {formatValue(max)}
        </span>
        <div className="absolute inset-x-0 top-4 h-px bg-bakery-border/25" />
        <div className="flex h-full items-end gap-[3px]">
          {points.map((p, i) => {
            const pct = p.value <= 0 ? 0 : Math.max(4, Math.round((p.value / max) * 100));
            const isActive = activeIndex === i;
            const showLabel = isActive || i === lastIndex;
            return (
              <div key={i} className="relative flex h-full flex-1 flex-col justify-end">
                <button
                  type="button"
                  className="absolute inset-0 flex flex-col justify-end"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() =>
                    setActiveIndex((cur) => (cur === i ? null : cur))
                  }
                  onFocus={() => setActiveIndex(i)}
                  onBlur={() => setActiveIndex((cur) => (cur === i ? null : cur))}
                  aria-label={`${p.fullLabel}: ${formatValue(p.value)}`}
                >
                  <div
                    className="relative mx-auto w-full max-w-[18px] rounded-t-[4px] transition-opacity"
                    style={{
                      height: `${pct}%`,
                      background: color,
                      opacity: isActive ? 1 : 0.82,
                    }}
                  >
                    {showLabel && (
                      <span className="pointer-events-none absolute bottom-full start-1/2 mb-1 -translate-x-1/2 whitespace-nowrap text-[10px] font-extrabold text-bakery-ink">
                        {formatValue(p.value)}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-1.5 flex gap-[3px]">
        {points.map((p, i) => (
          <p
            key={i}
            dir="ltr"
            className="flex-1 truncate text-center text-[9px] font-semibold text-bakery-muted"
          >
            {i === 0 || i === lastIndex || i === activeIndex ? p.label : ""}
          </p>
        ))}
      </div>
    </div>
  );
}

export function MasterPlatformGrowthCharts({
  businesses,
}: {
  businesses: StatsBusiness[];
}) {
  const [granularity, setGranularity] = useState<Granularity>("day");

  const { storePoints, revenuePoints, currentMrrUsd, activeSubsCount } =
    useMemo(() => {
      const buckets = buildBuckets(granularity, new Date());
      const storePts: ChartPoint[] = buckets.map((bucket) => ({
        label: bucket.label,
        fullLabel: bucket.fullLabel,
        value: 0,
      }));
      const revenuePts: ChartPoint[] = buckets.map((bucket) => ({
        label: bucket.label,
        fullLabel: bucket.fullLabel,
        value: 0,
      }));

      let mrr = 0;
      let activeSubs = 0;

      for (const b of businesses) {
        const createdAt = new Date(b.createdAt).getTime();
        const bucketIndex = buckets.findIndex(
          (bucket) => createdAt >= bucket.start && createdAt < bucket.end,
        );
        if (bucketIndex !== -1) storePts[bucketIndex].value += 1;

        if (b.subscriptionActiveAt) {
          activeSubs += 1;
          mrr += subscriptionPriceUsd(b);

          const activeAt = new Date(b.subscriptionActiveAt).getTime();
          const revenueBucketIndex = buckets.findIndex(
            (bucket) => activeAt >= bucket.start && activeAt < bucket.end,
          );
          if (revenueBucketIndex !== -1) {
            revenuePts[revenueBucketIndex].value += subscriptionPriceUsd(b);
          }
        }
      }

      return {
        storePoints: storePts,
        revenuePoints: revenuePts,
        currentMrrUsd: mrr,
        activeSubsCount: activeSubs,
      };
    }, [businesses, granularity]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-extrabold text-bakery-ink">
          התקדמות לאורך זמן
        </p>
        <div className="inline-flex shrink-0 rounded-[14px] border border-bakery-border/35 bg-bakery-input/60 p-1">
          {GRANULARITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setGranularity(opt.value)}
              className={`rounded-[10px] px-3 py-1.5 text-[12px] font-bold transition ${
                granularity === opt.value
                  ? "bg-bakery-primary text-bakery-on-primary"
                  : "text-bakery-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <MiniBarChart
        title="חנויות חדשות"
        icon={Store}
        color="var(--bakery-primary)"
        points={storePoints}
        totalLabel="סה״כ בתקופה:"
        formatValue={(n) => n.toLocaleString("en-US")}
      />

      <MiniBarChart
        title="הכנסה חדשה ממנויים"
        icon={TrendingUp}
        color="var(--bakery-sale)"
        points={revenuePoints}
        totalLabel="סה״כ בתקופה:"
        formatValue={(n) => `$${n.toLocaleString("en-US")}`}
      />

      <div className="rounded-[16px] border border-bakery-border/30 bg-bakery-input/60 px-3 py-2.5 text-[13px] text-bakery-ink">
        <span className="font-bold">הכנסה חודשית נוכחית (MRR):</span>{" "}
        <span className="font-extrabold text-bakery-success">
          ${currentMrrUsd.toLocaleString("en-US")}
        </span>{" "}
        מ-
        <span className="font-extrabold">{activeSubsCount}</span> מנויים
        פעילים
      </div>
    </div>
  );
}
