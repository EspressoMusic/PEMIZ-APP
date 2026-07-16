"use client";

import type { ComponentProps } from "react";
import { useState } from "react";
import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";
import { Clock } from "lucide-react";
import { DashboardActionRowButton } from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardDealsEntry } from "@/components/dashboard/deals-manager";
import { DashboardCouponsEntry } from "@/components/dashboard/coupons-manager";
import { DashboardOrderScheduleSettings } from "@/components/dashboard/dashboard-order-schedule-settings";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import {
  DEFAULT_STORE_PANELS_VISIBLE,
  type StorePanelsVisible,
} from "@/lib/store-panels-visible";

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
        fitContent
        panelClassName="dashboard-order-schedule-sheet"
      >
        <DashboardOrderScheduleSettings
          embeddedInSheet
          previewOnly={previewOnly}
          initialEnabled={initialEnabled}
          initialScheduleJson={initialScheduleJson}
        />
      </DashboardActionSheet>
    </>
  );
}

export function DashboardDealsAndLimitsHubGrid({
  previewOnly = false,
  initialOrderScheduleEnabled = false,
  initialOrderScheduleJson = null,
  initialProducts,
  initialDeals,
  panels = DEFAULT_STORE_PANELS_VISIBLE,
}: {
  previewOnly?: boolean;
  initialOrderScheduleEnabled?: boolean;
  initialOrderScheduleJson?: string | null;
  initialProducts?: ComponentProps<typeof DashboardDealsEntry>["initialProducts"];
  initialDeals?: ComponentProps<typeof DashboardDealsEntry>["initialDeals"];
  panels?: StorePanelsVisible;
}) {
  return (
    <ul className="space-y-2 text-start">
      {panels.sellerDeals ? (
        <DashboardDealsEntry
          previewOnly={previewOnly}
          initialProducts={initialProducts}
          initialDeals={initialDeals}
        />
      ) : null}
      {panels.sellerCoupons ? (
        <DashboardCouponsEntry previewOnly={previewOnly} />
      ) : null}
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
  initialProducts,
  initialDeals,
  panels = DEFAULT_STORE_PANELS_VISIBLE,
}: {
  basePath?: string;
  previewOnly?: boolean;
  initialOrderScheduleEnabled?: boolean;
  initialOrderScheduleJson?: string | null;
  initialProducts?: ComponentProps<typeof DashboardDealsEntry>["initialProducts"];
  initialDeals?: ComponentProps<typeof DashboardDealsEntry>["initialDeals"];
  panels?: StorePanelsVisible;
}) {
  return (
    <div className={`${DASHBOARD_PAGE_ROOT} justify-start text-center`}>
      <div className={`${DASHBOARD_SCROLL_MAIN} flex flex-col justify-start gap-3`}>
        <div className="px-1 text-start">
          <DashboardSettingsBackLink basePath={basePath} />
        </div>
        <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
          <DashboardDealsAndLimitsHubGrid
            previewOnly={previewOnly}
            initialOrderScheduleEnabled={initialOrderScheduleEnabled}
            initialOrderScheduleJson={initialOrderScheduleJson}
            initialProducts={initialProducts}
            initialDeals={initialDeals}
            panels={panels}
          />
        </div>
      </div>
    </div>
  );
}
