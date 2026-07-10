"use client";

import { Gift, ChevronLeft } from "lucide-react";
import { DashboardOrdersEntry } from "@/components/dashboard-client";
import { DashboardProductsEntry } from "@/components/dashboard/products-manager";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { DEV_PREVIEW_ORDERS, DEV_PREVIEW_PRODUCTS } from "@/lib/dev-preview-data";
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
  const isDevPreview = basePath.startsWith("/dev/");

  return (
    <ul className="dashboard-settings-style-rows space-y-2 text-start">
      <DashboardOrdersEntry
        previewOnly={isDevPreview}
        previewOrders={isDevPreview ? DEV_PREVIEW_ORDERS : undefined}
      />
      <DashboardProductsEntry
        previewOnly={isDevPreview}
        initialProducts={isDevPreview ? DEV_PREVIEW_PRODUCTS : undefined}
      />
      <DashboardActionRow
        href={`${basePath}/settings/deals-and-limits`}
        icon={Gift}
        title={labels.dealsAndLimits}
      />
    </ul>
  );
}

function DashboardStoreSettingsHubBody({
  basePath,
  embedded = false,
}: {
  basePath: string;
  embedded?: boolean;
}) {
  const grid = <DashboardStoreSettingsHubGrid basePath={basePath} />;
  if (embedded) return grid;
  return (
    <div className="dashboard-card dashboard-hub-panel bakery-float-panel shrink-0 rounded-[32px] p-3">
      {grid}
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
    return <DashboardStoreSettingsHubBody basePath={basePath} embedded />;
  }

  return (
    <>
      <div className="px-1 text-start">
        <DashboardStoreSettingsHubBack basePath={basePath} />
      </div>
      <DashboardStoreSettingsHubBody basePath={basePath} />
    </>
  );
}
