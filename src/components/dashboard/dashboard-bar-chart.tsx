export function DashboardBarChart({
  title,
  unit,
  points,
}: {
  title: string;
  unit: string;
  points: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...points.map((p) => p.value));

  return (
    <div className="rounded-[22px] border border-bakery-border/20 bg-[#fffbf6] p-4 shadow-[0_4px_18px_rgba(58,47,38,0.07)]">
      <h2 className="text-center text-[18px] font-extrabold text-bakery-ink">{title}</h2>
      <div className="mt-4 flex h-48 items-end justify-center gap-2 sm:gap-3">
        {points.map((p) => (
          <div
            key={p.label}
            className="flex h-full min-w-0 max-w-[48px] flex-1 flex-col items-center justify-end gap-1"
          >
            <span className="shrink-0 text-[11px] font-bold text-bakery-primary">
              {p.value}
              {unit ? ` ${unit}` : ""}
            </span>
            <div className="flex w-full flex-1 flex-col justify-end">
              <div
                className="w-full min-h-[6px] rounded-t-[10px] bg-gradient-to-t from-[#4a9fc9] to-[#8ad4ef] shadow-[0_2px_8px_rgba(58,47,38,0.12)] transition-all duration-500"
                style={{ height: `${Math.max(6, (p.value / max) * 100)}%` }}
              />
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-bakery-muted">
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
