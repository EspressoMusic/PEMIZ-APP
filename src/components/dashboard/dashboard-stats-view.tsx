"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageTitle } from "@/components/ui";
import { DashboardBarChart } from "@/components/dashboard/dashboard-bar-chart";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardStatsView({
  title,
  points,
  unit,
  backHref,
}: {
  title: string;
  points: { label: string; value: number }[];
  unit: string;
  backHref: string;
}) {
  const { labels } = useAppLocale();

  return (
    <div className="space-y-5 pb-2 text-center">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-[14px] font-bold text-bakery-primary"
      >
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        {labels.backToActions}
      </Link>
      <PageTitle>{title}</PageTitle>
      <DashboardBarChart title={title} unit={unit} points={points} />
    </div>
  );
}
