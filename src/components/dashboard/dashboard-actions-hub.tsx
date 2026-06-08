"use client";

import { useState } from "react";
import { Store, Users } from "lucide-react";
import { DashboardActionsSettingsGroup } from "@/components/dashboard/dashboard-actions-settings-group";
import { DashboardActionSquare } from "@/components/dashboard/dashboard-action-square";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardCustomersHubGrid } from "@/components/dashboard/dashboard-customers-hub";
import { DashboardStoreSettingsHubPanel } from "@/components/dashboard/dashboard-store-settings-hub";
import { DashboardAppointmentsSettingsHubPanel } from "@/components/dashboard/dashboard-appointments-settings-hub";
import type { DashboardOrderView } from "@/components/dashboard/dashboard-order-card";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardActionsHub({
  businessType,
  basePath = "/dashboard",
  previewOnly = false,
  previewCustomerOrders = [],
}: {
  businessType: string;
  basePath?: string;
  previewOnly?: boolean;
  previewCustomerOrders?: DashboardOrderView[];
}) {
  const { labels } = useAppLocale();
  const [customersOpen, setCustomersOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const showStoreHub = businessType === "STORE";
  const showAppointmentsHub = businessType === "APPOINTMENTS";

  return (
    <div className="flex h-full min-h-0 flex-col px-3 py-3 text-center sm:py-4">
      <div className="flex min-h-0 flex-1 flex-col justify-start gap-3 pb-2">
        <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
          <div className="grid grid-cols-2 gap-2 [&>*]:min-w-0">
            <DashboardActionSquare
              onClick={() => setCustomersOpen(true)}
              icon={Users}
              label={labels.customers}
            />
            {showStoreHub || showAppointmentsHub ? (
              <DashboardActionSquare
                onClick={() => setStoreOpen(true)}
                icon={Store}
                label={labels.store}
              />
            ) : (
              <DashboardActionSquare
                href={`${basePath}/settings`}
                icon={Store}
                label={labels.store}
              />
            )}
          </div>
        </div>

        <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
          <ul className="space-y-2 text-start">
            <DashboardActionsSettingsGroup
              basePath={basePath}
              previewOnly={previewOnly}
              businessType={businessType}
              previewCustomerOrders={previewCustomerOrders}
            />
          </ul>
        </div>
      </div>

      <DashboardActionSheet
        open={customersOpen}
        onClose={() => setCustomersOpen(false)}
        ariaLabel={labels.customers}
        placement="top"
        showBackButton
      >
        <DashboardCustomersHubGrid basePath={basePath} embedded />
      </DashboardActionSheet>

      {showStoreHub ? (
        <DashboardActionSheet
          open={storeOpen}
          onClose={() => setStoreOpen(false)}
          ariaLabel={labels.store}
          placement="top"
          showBackButton
          backButtonLabel={labels.backToActions}
        >
          <DashboardStoreSettingsHubPanel basePath={basePath} embedded />
        </DashboardActionSheet>
      ) : null}
      {showAppointmentsHub ? (
        <DashboardActionSheet
          open={storeOpen}
          onClose={() => setStoreOpen(false)}
          ariaLabel={labels.store}
          placement="top"
          showBackButton
          backButtonLabel={labels.backToActions}
        >
          <DashboardAppointmentsSettingsHubPanel
            basePath={basePath}
            embedded
          />
        </DashboardActionSheet>
      ) : null}
    </div>
  );
}
