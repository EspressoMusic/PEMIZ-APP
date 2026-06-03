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
    <div className="space-y-3">
      {title ? (
        <h2 className="text-center text-[18px] font-extrabold text-bakery-ink">{title}</h2>
      ) : null}
      <DashboardLineChart points={points} compact={compact} />
    </div>
  );
}
