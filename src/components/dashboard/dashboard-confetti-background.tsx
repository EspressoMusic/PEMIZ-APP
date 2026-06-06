"use client";

import { useMemo } from "react";

type Piece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
};

export function DashboardConfettiBackground({ active }: { active: boolean }) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const pieces = useMemo<Piece[]>(() => {
    if (reducedMotion) return [];
    const colors = ["#e6d4b8", "#5c4a3e", "#c9b89a", "#43a047", "#7eb8ff", "#f4f0e8"];
    return Array.from({ length: 24 }, (_, id) => ({
      id,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.2 + Math.random() * 1.4,
      color: colors[id % colors.length]!,
      size: 5 + Math.floor(Math.random() * 7),
    }));
  }, [active, reducedMotion]);

  if (!active || reducedMotion || pieces.length === 0) return null;

  return (
    <div
      className="confetti-layer pointer-events-none fixed inset-0 z-[60] overflow-hidden"
      aria-hidden
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.35,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
