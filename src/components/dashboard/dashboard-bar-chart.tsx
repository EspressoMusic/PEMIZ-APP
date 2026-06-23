import { DashboardLineChart } from "@/components/dashboard/dashboard-line-chart";

/** @deprecated Use DashboardLineChart — kept for order stats page */
export function DashboardBarChart({
  title,
  unit: _unit,
  points,
  compact = false,
}: {
  title: string;
  unit: string;
  points: { label: string; value: number }[];
  compact?: boolean;
}) {
  return (
    <DashboardLineChart points={points} compact={compact} title={title} />
  );
}
