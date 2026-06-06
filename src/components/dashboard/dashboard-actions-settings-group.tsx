"use client";

import { useState } from "react";
import { Bell, ChevronDown, Settings, Smartphone, TrendingUp, User } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { DashboardStoreStylePicker } from "@/components/dashboard/dashboard-store-style-picker";

export function DashboardActionsSettingsGroup({
  basePath = "/dashboard",
  previewOnly = false,
}: {
  basePath?: string;
  previewOnly?: boolean;
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
        className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
          open ? "bakery-float-tile--active" : ""
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
        <ul
          id="dashboard-settings-items"
          className="space-y-2 text-start"
        >
          <DashboardActionRow
            href={`${basePath}/stats/sales`}
            icon={TrendingUp}
            title={labels.salesAndProfit}
          />
          <DashboardStoreStylePicker previewOnly={previewOnly} />
          <DashboardActionRow
            href={`${basePath}/settings/alerts`}
            icon={Bell}
            title={labels.alerts}
          />
          <DashboardActionRow
            href={`${basePath}/settings/app`}
            icon={Smartphone}
            title={labels.installApp}
          />
          <DashboardActionRow
            href={`${basePath}/settings/account`}
            icon={User}
            title={labels.accountAndLink}
          />
        </ul>
      )}
    </li>
  );
}
