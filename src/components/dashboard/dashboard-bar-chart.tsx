export function DashboardBarChart({
  title,
  unit,
  points,
  compact = false,
}: {
  title: string;
  unit: string;
  points: { label: string; value: number }[];
  /** צפוף יותר לתצוגה חודשית (30 נקודות) */
  compact?: boolean;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));

  return (
    <div className="rounded-[22px] border border-bakery-border/20 bg-[#fffbf6] p-4 shadow-[0_4px_18px_rgba(58,47,38,0.07)]">
      <h2 className="text-center text-[18px] font-extrabold text-bakery-ink">{title}</h2>
      <div
        className={`mt-4 flex items-end justify-center gap-1 sm:gap-2 ${
          compact ? "h-40 overflow-x-auto pb-1" : "h-48 gap-2 sm:gap-3"
        }`}
      >
        {points.map((p, i) => (
          <div
            key={`${p.label}-${i}`}
            className={`flex h-full min-w-0 flex-col items-center justify-end gap-1 ${
              compact ? "w-5 shrink-0 max-w-[20px]" : "max-w-[48px] flex-1"
            }`}
          >
            {!compact && (
              <span className="shrink-0 text-[11px] font-bold text-bakery-primary">
                {p.value}
                {unit ? ` ${unit}` : ""}
              </span>
            )}
            <div className="flex w-full flex-1 flex-col justify-end">
              <div
                className="w-full min-h-[6px] rounded-t-[10px] bg-gradient-to-t from-[#4a9fc9] to-[#8ad4ef] shadow-[0_2px_8px_rgba(58,47,38,0.12)] transition-all duration-500"
                style={{ height: `${Math.max(6, (p.value / max) * 100)}%` }}
              />
            </div>
            <span
              className={`shrink-0 font-semibold text-bakery-muted ${
                compact ? "text-[8px] leading-none" : "text-[10px]"
              }`}
            >
              {compact && i % 5 !== 0 ? "" : p.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
