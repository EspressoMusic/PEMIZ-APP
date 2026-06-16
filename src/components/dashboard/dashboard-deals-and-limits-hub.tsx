"use client";

import { useState } from "react";
import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";
import { Clock, Gift } from "lucide-react";
import {
  DashboardActionRow,
  DashboardActionRowButton,
} from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardOrderScheduleSettings } from "@/components/dashboard/dashboard-order-schedule-settings";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";

function DashboardStoreLimitsGroup({
  previewOnly = false,
  initialEnabled = false,
  initialScheduleJson = null,
}: {
  previewOnly?: boolean;
  initialEnabled?: boolean;
  initialScheduleJson?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();

  return (
    <>
      <DashboardActionRowButton
        onClick={() => setOpen(true)}
        icon={Clock}
        title={labels.limits}
        expanded={open}
        active={open}
      />
      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={labels.orderScheduleLimitTitle}
        ariaLabel={labels.limits}
        placement="center"
        showBackButton
        compact
        panelClassName="dashboard-order-schedule-sheet"
      >
        <DashboardOrderScheduleSettings
          inline
          previewOnly={previewOnly}
          initialEnabled={initialEnabled}
          initialScheduleJson={initialScheduleJson}
        />
      </DashboardActionSheet>
    </>
  );
}

export function DashboardDealsAndLimitsHubGrid({
  basePath = "/dashboard",
  previewOnly = false,
  initialOrderScheduleEnabled = false,
  initialOrderScheduleJson = null,
}: {
  basePath?: string;
  previewOnly?: boolean;
  initialOrderScheduleEnabled?: boolean;
  initialOrderScheduleJson?: string | null;
}) {
  const { labels } = useAppLocale();

  return (
    <ul className="space-y-2 text-start">
      <DashboardActionRow
        href={`${basePath}/settings/deals`}
        icon={Gift}
        title={labels.deals}
      />
      <DashboardStoreLimitsGroup
        previewOnly={previewOnly}
        initialEnabled={initialOrderScheduleEnabled}
        initialScheduleJson={initialOrderScheduleJson}
      />
    </ul>
  );
}

export function DashboardDealsAndLimitsHub({
  basePath = "/dashboard",
  previewOnly = false,
  initialOrderScheduleEnabled = false,
  initialOrderScheduleJson = null,
}: {
  basePath?: string;
  previewOnly?: boolean;
  initialOrderScheduleEnabled?: boolean;
  initialOrderScheduleJson?: string | null;
}) {
  return (
    <div className={`${DASHBOARD_PAGE_ROOT} justify-start text-center`}>
      <div className={`${DASHBOARD_SCROLL_MAIN} flex flex-col justify-start gap-3`}>
        <div className="px-1 text-start">
          <DashboardSettingsBackLink basePath={basePath} />
        </div>
        <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
          <DashboardDealsAndLimitsHubGrid
            basePath={basePath}
            previewOnly={previewOnly}
            initialOrderScheduleEnabled={initialOrderScheduleEnabled}
            initialOrderScheduleJson={initialOrderScheduleJson}
          />
        </div>
      </div>
    </div>
  );
}
