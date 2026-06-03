type Props = {
  percent?: number;
  className?: string;
  /** גובה רב יותר בדף בית מפורס */
  tall?: boolean;
};

const BUBBLES = [
  { left: "8%", size: 6, delay: 0, duration: 3.2 },
  { left: "22%", size: 4, delay: 0.5, duration: 2.8 },
  { left: "38%", size: 7, delay: 1, duration: 3.5 },
  { left: "52%", size: 5, delay: 0.2, duration: 3 },
  { left: "68%", size: 6, delay: 1.4, duration: 3.8 },
] as const;

/** מלבן מים — מד התקדמות אופקי, קומפטי לדף בית */
export function DashboardHomeGauge({
  percent = 100,
  className = "",
  tall = false,
}: Props) {
  const clamped = Math.min(100, Math.max(0, percent));
  const label = `${Math.round(clamped)}%`;

  return (
    <div
      className={`dashboard-water-gauge dashboard-water-gauge--bar relative w-full min-w-0 ${
        tall ? "h-[4.25rem] sm:h-[4.75rem]" : "h-14"
      } ${className}`}
      style={{ ["--water-level" as string]: `${clamped}%` }}
      aria-label={label}
      role="img"
    >
      <div className="dashboard-water-gauge__rim absolute inset-0 rounded-[18px]" />
      <div className="dashboard-water-gauge__body absolute inset-[4px] overflow-hidden rounded-[14px]">
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
        <span className="text-[22px] font-extrabold tracking-tight text-bakery-ink drop-shadow-[0_1px_3px_rgba(255,251,246,0.95)]">
          {label}
        </span>
      </div>
    </div>
  );
}
