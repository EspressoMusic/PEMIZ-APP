type Props = {
  percent?: number;
  className?: string;
};

const BUBBLES = [
  { left: "12%", size: 10, delay: 0, duration: 3.8 },
  { left: "28%", size: 6, delay: 0.6, duration: 3.2 },
  { left: "45%", size: 12, delay: 1.1, duration: 4.2 },
  { left: "62%", size: 7, delay: 0.3, duration: 3.5 },
  { left: "78%", size: 9, delay: 1.8, duration: 4 },
  { left: "88%", size: 5, delay: 2.4, duration: 2.9 },
  { left: "35%", size: 8, delay: 2.1, duration: 3.6 },
  { left: "55%", size: 6, delay: 0.9, duration: 3.1 },
] as const;

/** עיגול מרכזי בדף בית — מים נעים, גלים ובועות */
export function DashboardHomeGauge({ percent = 100, className = "" }: Props) {
  const clamped = Math.min(100, Math.max(0, percent));
  const label = `${Math.round(clamped)}%`;

  return (
    <div className={`flex justify-center py-4 sm:py-6 ${className}`}>
      <div
        className="dashboard-water-gauge relative h-[200px] w-[200px] shrink-0 sm:h-[220px] sm:w-[220px]"
        style={{ ["--water-level" as string]: `${clamped}%` }}
        aria-label={label}
      >
        <div className="dashboard-water-gauge__rim absolute inset-0 rounded-full" />
        <div className="dashboard-water-gauge__body absolute inset-[6px] overflow-hidden rounded-full">
          <div className="dashboard-water-gauge__fill">
            <div className="dashboard-water-gauge__surface">
              <div className="dashboard-water-gauge__wave dashboard-water-gauge__wave--a" />
              <div className="dashboard-water-gauge__wave dashboard-water-gauge__wave--b" />
              <div className="dashboard-water-gauge__wave dashboard-water-gauge__wave--c" />
            </div>
            <div className="dashboard-water-gauge__shimmer" aria-hidden />
            {BUBBLES.map((b, i) => (
              <span
                key={i}
                className="dashboard-water-gauge__bubble"
                style={{
                  left: b.left,
                  width: b.size,
                  height: b.size,
                  animationDuration: `${b.duration}s`,
                  animationDelay: `${b.delay}s`,
                }}
                aria-hidden
              />
            ))}
          </div>
        </div>
        <div className="dashboard-water-gauge__label absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <span className="text-[32px] font-extrabold tracking-tight text-bakery-ink drop-shadow-[0_2px_4px_rgba(255,251,246,0.95)] sm:text-[36px]">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
