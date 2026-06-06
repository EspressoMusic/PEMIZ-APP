"use client";

import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";
import {
  Package,
  Clock,
  ClipboardList,
  Gift,
  ChevronLeft,
} from "lucide-react";
import { DashboardActionSquare } from "@/components/dashboard/dashboard-action-square";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";

function DashboardStoreSettingsHubBack({
  basePath = "/dashboard",
  onBack,
}: {
  basePath?: string;
  onBack?: () => void;
}) {
  const { labels } = useAppLocale();

  if (onBack) {
    return (
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] shrink-0 items-center gap-1 text-[14px] font-bold text-bakery-primary transition active:opacity-80"
      >
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        {labels.backToActions}
      </button>
    );
  }

  return <DashboardActionsBackLink basePath={basePath} />;
}

export function DashboardStoreSettingsHubGrid({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const { labels } = useAppLocale();

  return (
    <div className="grid grid-cols-2 gap-2">
      <DashboardActionSquare
        href={`${basePath}/settings/products`}
        icon={Package}
        label={labels.products}
      />
      <DashboardActionSquare
        href={`${basePath}/settings/orders`}
        icon={ClipboardList}
        label={labels.orders}
      />
      <DashboardActionSquare
        href={`${basePath}/settings/deals`}
        icon={Gift}
        label={labels.deals}
      />
      <DashboardActionSquare
        href={`${basePath}/settings/limits`}
        icon={Clock}
        label={labels.limits}
      />
    </div>
  );
}

export function DashboardStoreSettingsHubPanel({
  basePath = "/dashboard",
  embedded = false,
}: {
  basePath?: string;
  /** Inside action sheet — outer panel already provided. */
  embedded?: boolean;
}) {
  if (embedded) {
    return <DashboardStoreSettingsHubGrid basePath={basePath} />;
  }

  return (
    <>
      <div className="px-1 text-start">
        <DashboardStoreSettingsHubBack basePath={basePath} />
      </div>
      <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
        <DashboardStoreSettingsHubGrid basePath={basePath} />
      </div>
    </>
  );
}

export function DashboardStoreSettingsHub({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  return (
    <div className={`${DASHBOARD_PAGE_ROOT} justify-start text-center`}>
      <div className={`${DASHBOARD_SCROLL_MAIN} flex flex-col justify-start gap-3`}>
        <DashboardStoreSettingsHubPanel basePath={basePath} />
      </div>
    </div>
  );
}
