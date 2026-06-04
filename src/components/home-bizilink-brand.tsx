"use client";

import { useCallback, useRef, useState } from "react";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";

const CONFETTI_MS = 3200;

export function HomeBizilinkBrand() {
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playConfetti = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setConfettiBurst((n) => n + 1);
    setConfettiActive(true);
    timeoutRef.current = setTimeout(() => {
      setConfettiActive(false);
      timeoutRef.current = null;
    }, CONFETTI_MS);
  }, []);

  return (
    <>
      <DashboardConfettiBackground key={confettiBurst} active={confettiActive} />
      <span
        className="home-bizilink-brand text-bakery-primary"
        onMouseEnter={playConfetti}
        onFocus={playConfetti}
        tabIndex={0}
        role="img"
        aria-label="BiziLink"
      >
        BiziLink
      </span>
    </>
  );
}
