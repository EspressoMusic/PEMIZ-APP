"use client";

import { useEffect, useRef } from "react";

/** Runs callback on an interval; slows down when the tab is hidden. */
export function useVisibilityInterval(
  callback: () => void | Promise<void>,
  activeMs: number,
  hiddenMs = activeMs * 6,
  enabled = true
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => void cbRef.current();

    const reschedule = () => {
      if (timer) clearInterval(timer);
      const ms =
        typeof document !== "undefined" && document.hidden
          ? hiddenMs
          : activeMs;
      timer = setInterval(tick, ms);
    };

    tick();
    reschedule();

    const onVisibility = () => {
      if (!document.hidden) tick();
      reschedule();
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [activeMs, hiddenMs, enabled]);
}
