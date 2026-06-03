"use client";

import { useMemo } from "react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { last7DayBuckets } from "@/lib/dashboard-stats";
import { DashboardStatsView } from "@/components/dashboard/dashboard-stats-view";

export function DashboardOrdersStatsClient({
  orderDates,
  backHref = "/dashboard/actions",
}: {
  orderDates: string[];
  backHref?: string;
}) {
  const { locale, labels } = useAppLocale();

  const points = useMemo(() => {
    const buckets = last7DayBuckets(locale);
    const counts = buckets.map(() => 0);
    for (const iso of orderDates) {
      const key = iso.slice(0, 10);
      const idx = buckets.findIndex((b) => b.key === key);
      if (idx >= 0) counts[idx] += 1;
    }
    return buckets.map((b, i) => ({ label: b.label, value: counts[i] ?? 0 }));
  }, [orderDates, locale]);

  return (
    <DashboardStatsView
      title={labels.orderStatsTitle}
      unit=""
      points={points}
      backHref={backHref}
    />
  );
}
