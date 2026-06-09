"use client";

import { useState } from "react";
import { ChevronDown, Settings, TrendingUp } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  DASHBOARD_ACTION_ROW_CLASS,
  DashboardActionRow,
} from "@/components/dashboard/dashboard-action-row";
import { DashboardAccountSettingsGroup } from "@/components/dashboard/dashboard-account-settings-group";
import { DashboardCalendarLimitsSettingsGroup } from "@/components/dashboard/dashboard-calendar-limits-settings-group";

export function DashboardActionsSettingsGroup({
  basePath = "/dashboard",
  previewOnly = false,
  businessType = "STORE",
}: {
  basePath?: string;
  previewOnly?: boolean;
  businessType?: string;
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();

  return (
    <li className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="dashboard-settings-items"
        className={`${DASHBOARD_ACTION_ROW_CLASS}${
          open ? " bakery-float-tile--active" : ""
        }`}
      >
        <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
          <Settings className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
          {labels.settings}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={2.5}
          aria-hidden
        />
      </button>

      {open && (
        <div id="dashboard-settings-items" className="space-y-2 text-start">
          <ul className="space-y-2">
            {businessType === "STORE" ? (
              <DashboardActionRow
                href={`${basePath}/stats/sales`}
                icon={TrendingUp}
                title={labels.salesAndProfit}
              />
            ) : null}
            {businessType === "APPOINTMENTS" ? (
              <DashboardCalendarLimitsSettingsGroup basePath={basePath} />
            ) : null}
            <DashboardAccountSettingsGroup
              basePath={basePath}
              previewOnly={previewOnly}
            />
          </ul>
        </div>
      )}
    </li>
  );
}
