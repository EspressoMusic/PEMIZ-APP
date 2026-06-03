"use client";

const GRID_LINES = 4;

export function DashboardLineChart({
  points,
  compact = false,
}: {
  points: { label: string; value: number }[];
  compact?: boolean;
}) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const padX = 6;
  const padY = 8;
  const w = 100;
  const h = 52;

  const coords = points.map((p, i) => {
    const x =
      points.length <= 1
        ? w / 2
        : padX + (i / (points.length - 1)) * (w - padX * 2);
    const y = padY + (1 - p.value / max) * (h - padY * 2);
    return { x, y, label: p.label };
  });

  const linePath =
    coords.length > 0
      ? coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ")
      : "";

  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1]!.x} ${h} L ${coords[0]!.x} ${h} Z`
      : "";

  return (
    <div className="bakery-float-panel overflow-x-hidden rounded-[22px] p-4 sm:p-5">
        <div className="relative h-44 sm:h-48">
          <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between">
            {Array.from({ length: GRID_LINES }).map((_, i) => (
              <div
                key={i}
                className="h-px w-full bg-bakery-ink/12"
                aria-hidden
              />
            ))}
          </div>

          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="absolute inset-x-0 top-0 bottom-8 h-[calc(100%-2rem)] w-full overflow-visible"
            preserveAspectRatio="none"
            aria-hidden
          >
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#sales-line-fill)"
                className="opacity-40"
              />
            )}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="var(--bakery-ink)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {coords.map((c, i) => (
              <circle
                key={`${c.label}-${i}`}
                cx={c.x}
                cy={c.y}
                r="1.8"
                fill="var(--bakery-ink)"
              />
            ))}
            <defs>
              <linearGradient id="sales-line-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--bakery-ink)" stopOpacity="0.12" />
                <stop offset="100%" stopColor="var(--bakery-ink)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div
          className={`mt-1 flex justify-between gap-1 text-[11px] font-semibold text-bakery-muted ${
            compact ? "px-0.5" : ""
          }`}
        >
          {points.map((p, i) => (
            <span
              key={`${p.label}-${i}`}
              className={`min-w-0 flex-1 truncate text-center ${
                compact && i % 5 !== 0 ? "opacity-0" : ""
              }`}
            >
              {p.label}
            </span>
          ))}
        </div>
    </div>
  );
}
