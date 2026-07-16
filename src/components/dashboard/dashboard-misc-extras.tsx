"use client";

import { Bell, Smartphone } from "lucide-react";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { DashboardStoreCustomers } from "@/components/dashboard/dashboard-store-customers";
import { DashboardOrderConfirmationSettings } from "@/components/dashboard/dashboard-order-confirmation-settings";
import type { DashboardOrderView } from "@/components/dashboard/dashboard-order-card";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { useNativeApp } from "@/hooks/use-native-app";

export function DashboardMiscExtras({
  basePath = "/dashboard",
  previewOnly = false,
  previewOrders = [] as DashboardOrderView[],
  initialOrderConfirmationRequired = true,
  alertsVisible = true,
  installAppVisible = true,
}: {
  basePath?: string;
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
  initialOrderConfirmationRequired?: boolean;
  alertsVisible?: boolean;
  installAppVisible?: boolean;
}) {
  const { labels } = useAppLocale();
  const nativeApp = useNativeApp();

  return (
    <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
      <ul className="space-y-2 text-start">
        <DashboardStoreCustomers
          embedded
          previewOnly={previewOnly}
          previewOrders={previewOrders}
        />
        {alertsVisible ? (
          <DashboardActionRow
            href={`${basePath}/settings/alerts`}
            icon={Bell}
            title={labels.alerts}
          />
        ) : null}
        {installAppVisible && !nativeApp ? (
          <DashboardActionRow
            href={`${basePath}/settings/app`}
            icon={Smartphone}
            title={labels.installApp}
          />
        ) : null}
        <DashboardOrderConfirmationSettings
          embedded
          initialRequired={initialOrderConfirmationRequired}
          previewOnly={previewOnly}
        />
      </ul>
    </div>
  );
}
