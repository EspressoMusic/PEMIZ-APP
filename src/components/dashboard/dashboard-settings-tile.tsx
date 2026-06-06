"use client";

import type { ReactNode } from "react";
import {
  DASHBOARD_SETTINGS_TILE,
  DASHBOARD_SETTINGS_TILE_INNER,
} from "@/components/dashboard/dashboard-settings-bar";

export function DashboardSettingsTile({
  children,
  className = "",
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "danger";
}) {
  const borderClass =
    variant === "danger" ? "border-bakery-error/35" : "border-bakery-border/45";

  return (
    <section className={`${DASHBOARD_SETTINGS_TILE} ${borderClass} ${className}`}>
      {children}
    </section>
  );
}

export function DashboardSettingsTileRow({
  panel,
  action,
}: {
  panel: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="px-3 py-3.5">
      <div
        className={`${DASHBOARD_SETTINGS_TILE_INNER} flex min-h-11 items-center gap-3 px-3 py-2.5 ${
          action ? "justify-between" : "justify-center"
        }`}
      >
        <div className="min-w-0 flex-1 text-center">{panel}</div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
