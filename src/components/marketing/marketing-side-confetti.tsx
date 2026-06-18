"use client";

import { useMemo } from "react";

type Piece = {
  id: number;
  side: "left" | "right";
  top: number;
  delay: number;
  duration: number;
  drift: number;
  lift: number;
  color: string;
  size: number;
  rotate: number;
};

const COLORS = [
  "#a78bfa",
  "#7c3aed",
  "#c4b5fd",
  "#ddd6fe",
  "#f0abfc",
  "#e879f9",
  "#fbbf24",
  "#f472b6",
];

export function MarketingSideConfetti({
  active,
  burst,
}: {
  active: boolean;
  burst: number;
}) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const pieces = useMemo<Piece[]>(() => {
    if (reducedMotion) return [];
    return Array.from({ length: 40 }, (_, id) => ({
      id,
      side: id % 2 === 0 ? "left" : "right",
      top: 8 + Math.random() * 72,
      delay: Math.random() * 0.45,
      duration: 2.1 + Math.random() * 1.3,
      drift: (Math.random() - 0.5) * 120,
      lift: 45 + Math.random() * 35,
      color: COLORS[id % COLORS.length]!,
      size: 6 + Math.floor(Math.random() * 6),
      rotate: (Math.random() - 0.5) * 720,
    }));
  }, [burst, reducedMotion]);

  if (!active || reducedMotion || pieces.length === 0) return null;

  return (
    <div className="marketing-side-confetti" aria-hidden>
      {pieces.map((p) => (
        <span
          key={`${burst}-${p.id}`}
          className={`marketing-confetti-piece marketing-confetti-piece--${p.side}`}
          style={{
            top: `${p.top}%`,
            width: p.size,
            height: p.size * 1.25,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--confetti-drift" as string]: `${p.drift}px`,
            ["--confetti-lift" as string]: `${p.lift}vh`,
            ["--confetti-rotate" as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}
