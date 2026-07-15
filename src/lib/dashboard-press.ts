import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export const DASHBOARD_PRESSABLE_CLASS = "dashboard-pressable";

export function getDashboardPressProps<T extends HTMLElement>() {
  return {
    onPointerDown: (e: ReactPointerEvent<T>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.currentTarget.classList.add("dashboard-press--active");
    },
    onPointerUp: (e: ReactPointerEvent<T>) => {
      releaseDashboardPress(e.currentTarget);
    },
    onPointerLeave: (e: ReactPointerEvent<T>) => {
      e.currentTarget.classList.remove("dashboard-press--active");
    },
    onPointerCancel: (e: ReactPointerEvent<T>) => {
      e.currentTarget.classList.remove("dashboard-press--active");
    },
  };
}

function releaseDashboardPress(el: HTMLElement) {
  requestAnimationFrame(() => {
    window.setTimeout(() => {
      el.classList.remove("dashboard-press--active");
    }, 120);
  });
}

/** Detects a press-and-hold on a row (e.g. to enter a multi-select mode) without hijacking normal taps/clicks. */
export function useDashboardLongPress<T extends HTMLElement>(
  onLongPress: () => void,
  delay = 500
) {
  const timerRef = useRef<number | null>(null);
  const firedRef = useRef(false);

  function clearTimer() {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  return {
    onPointerDown: (e: ReactPointerEvent<T>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      firedRef.current = false;
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        firedRef.current = true;
        onLongPress();
      }, delay);
    },
    onPointerUp: clearTimer,
    onPointerLeave: clearTimer,
    onPointerCancel: clearTimer,
    onPointerMove: clearTimer,
    /** Call from the click handler; returns true (and consumes the flag) if this click followed a long-press. */
    consumeLongPress: () => {
      const fired = firedRef.current;
      firedRef.current = false;
      return fired;
    },
  };
}
