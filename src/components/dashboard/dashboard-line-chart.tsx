"use client";

import { useId, useMemo, useState } from "react";

const GRID_LINES = 6;

function buildSmoothPath(coords: { x: number; y: number }[]): string {
  if (coords.length === 0) return "";
  if (coords.length === 1) {
    const p = coords[0]!;
    return `M ${p.x} ${p.y}`;
  }

  let d = `M ${coords[0]!.x} ${coords[0]!.y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i - 1] ?? coords[i]!;
    const p1 = coords[i]!;
    const p2 = coords[i + 1]!;
    const p3 = coords[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function niceChartMax(value: number): number {
  if (value <= 0) return 1;
  const padded = value * 1.08;
  const magnitude = 10 ** Math.floor(Math.log10(padded));
  const normalized = padded / magnitude;
  const nice =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

function defaultFormatAxis(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return Number.isInteger(m) ? `${m}M` : `${m.toFixed(1)}M`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    return Number.isInteger(k) ? `${k}K` : `${k.toFixed(1)}K`;
  }
  return String(Math.round(value));
}

export type DashboardLineChartSummary = {
  metricLabel: string;
  metricValue: string;
  trendText: string;
  trendDirection: "up" | "down" | "neutral";
  periodLabel?: string;
};

export function DashboardLineChart({
  points,
  compact = false,
  title,
  formatValue = defaultFormatAxis,
  formatTooltipValue,
  summary,
}: {
  points: { label: string; value: number }[];
  compact?: boolean;
  title?: string;
  formatValue?: (value: number) => string;
  formatTooltipValue?: (value: number) => string;
  summary?: DashboardLineChartSummary;
}) {
  const uid = useId().replace(/:/g, "");
  const fillId = `chart-fill-${uid}`;
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const tooltipFormat = formatTooltipValue ?? formatValue;
  const rawMax = Math.max(...points.map((p) => p.value), 0);
  const max = niceChartMax(rawMax);

  const padX = 2;
  const padY = 4;
  const w = 100;
  const h = 52;

  const coords = useMemo(
    () =>
      points.map((p, i) => {
        const x =
          points.length <= 1
            ? w / 2
            : padX + (i / (points.length - 1)) * (w - padX * 2);
        const y = padY + (1 - p.value / max) * (h - padY * 2);
        return { x, y, label: p.label, value: p.value };
      }),
    [points, max]
  );

  const linePath = buildSmoothPath(coords);
  const areaPath =
    coords.length > 0
      ? `${linePath} L ${coords[coords.length - 1]!.x} ${h} L ${coords[0]!.x} ${h} Z`
      : "";

  const yTicks = Array.from({ length: GRID_LINES }, (_, i) => {
    const position = i / (GRID_LINES - 1);
    return { position, label: formatValue(max * (1 - position)) };
  });

  const activeIndex = hoverIndex ?? coords.length - 1;
  const activeCoord = coords[activeIndex];

  return (
    <div className="dashboard-line-chart">
      {(title || summary?.periodLabel) && (
        <div className="dashboard-line-chart__header">
          {title ? (
            <p className="dashboard-line-chart__title">{title}</p>
          ) : (
            <span />
          )}
          {summary?.periodLabel ? (
            <span className="dashboard-line-chart__period">{summary.periodLabel}</span>
          ) : null}
        </div>
      )}

      {summary ? (
        <div className="dashboard-line-chart__summary">
          <p className="dashboard-line-chart__metric-label">{summary.metricLabel}</p>
          <p className="dashboard-line-chart__metric-value">{summary.metricValue}</p>
          <p
            className={`dashboard-line-chart__trend dashboard-line-chart__trend--${summary.trendDirection}`}
          >
            {summary.trendText}
          </p>
        </div>
      ) : null}

      <div className="dashboard-line-chart__body" dir="ltr">
        <div className="dashboard-line-chart__y-axis" aria-hidden>
          {yTicks.map((tick) => (
            <span
              key={tick.position}
              className="dashboard-line-chart__y-label"
              style={{ top: `${tick.position * 100}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>

        <div
          className="dashboard-line-chart__plot"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <div className="dashboard-line-chart__grid" aria-hidden>
            {yTicks.map((tick) => (
              <div
                key={tick.position}
                className="dashboard-line-chart__grid-line"
                style={{ top: `${tick.position * 100}%` }}
              />
            ))}
          </div>

          {activeCoord && hoverIndex !== null ? (
            <div
              className="dashboard-line-chart__guide"
              style={{ left: `${activeCoord.x}%` }}
              aria-hidden
            />
          ) : null}

          {activeCoord && hoverIndex !== null ? (
            <div
              className="dashboard-line-chart__tooltip"
              style={{
                left: `${activeCoord.x}%`,
                top: `${(activeCoord.y / h) * 100}%`,
              }}
            >
              <p className="dashboard-line-chart__tooltip-label">
                {activeCoord.label}
              </p>
              <p className="dashboard-line-chart__tooltip-value">
                <span className="dashboard-line-chart__tooltip-dot" aria-hidden />
                {tooltipFormat(activeCoord.value)}
              </p>
            </div>
          ) : null}

          <svg
            viewBox={`0 0 ${w} ${h}`}
            className="dashboard-line-chart__svg"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-accent)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--chart-accent)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {areaPath ? <path d={areaPath} fill={`url(#${fillId})`} /> : null}

            {linePath ? (
              <path
                d={linePath}
                fill="none"
                stroke="var(--chart-accent)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className="dashboard-line-chart__line"
              />
            ) : null}

            {coords.map((c, i) => {
              const isLast = i === coords.length - 1;
              const isActive = i === activeIndex;
              return (
                <circle
                  key={`${c.label}-${i}`}
                  cx={c.x}
                  cy={c.y}
                  r={isActive && hoverIndex !== null ? "2.6" : "1.8"}
                  className={
                    isLast
                      ? "dashboard-line-chart__dot dashboard-line-chart__dot--last"
                      : "dashboard-line-chart__dot"
                  }
                />
              );
            })}
          </svg>

          <div className="dashboard-line-chart__hit-layer" aria-hidden>
            {coords.map((c, i) => (
              <button
                key={`hit-${c.label}-${i}`}
                type="button"
                className="dashboard-line-chart__hit"
                style={{
                  left: `${c.x}%`,
                  top: `${(c.y / h) * 100}%`,
                }}
                onMouseEnter={() => setHoverIndex(i)}
                onFocus={() => setHoverIndex(i)}
                aria-label={`${c.label}: ${tooltipFormat(c.value)}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        className={`dashboard-line-chart__x-labels ${
          compact ? "dashboard-line-chart__x-labels--compact" : ""
        }`}
        dir="ltr"
      >
        {points.map((p, i) => (
          <span
            key={`${p.label}-${i}`}
            className={`dashboard-line-chart__x-label ${
              compact && i % 5 !== 0 ? "opacity-0" : ""
            } ${hoverIndex === i ? "dashboard-line-chart__x-label--active" : ""}`}
          >
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
