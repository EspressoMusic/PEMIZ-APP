"use client";

import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";
import { Clock, Gift } from "lucide-react";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";

export function DashboardDealsAndLimitsHubGrid({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const { labels } = useAppLocale();

  return (
    <ul className="space-y-2 text-start">
      <DashboardActionRow
        href={`${basePath}/settings/deals`}
        icon={Gift}
        title={labels.deals}
      />
      <DashboardActionRow
        href={`${basePath}/settings/limits`}
        icon={Clock}
        title={labels.limits}
      />
    </ul>
  );
}

export function DashboardDealsAndLimitsHub({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  return (
    <div className={`${DASHBOARD_PAGE_ROOT} justify-start text-center`}>
      <div className={`${DASHBOARD_SCROLL_MAIN} flex flex-col justify-start gap-3`}>
        <div className="px-1 text-start">
          <DashboardSettingsBackLink basePath={basePath} />
        </div>
        <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
          <DashboardDealsAndLimitsHubGrid basePath={basePath} />
        </div>
      </div>
    </div>
  );
}
