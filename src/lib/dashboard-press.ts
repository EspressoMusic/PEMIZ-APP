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
