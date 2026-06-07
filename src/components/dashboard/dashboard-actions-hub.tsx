"use client";

import { useState } from "react";
import { Users, Store } from "lucide-react";
import { DashboardActionsSettingsGroup } from "@/components/dashboard/dashboard-actions-settings-group";
import { DashboardActionSquare } from "@/components/dashboard/dashboard-action-square";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardCustomersHubGrid } from "@/components/dashboard/dashboard-customers-hub";
import { DashboardStoreSettingsHubPanel } from "@/components/dashboard/dashboard-store-settings-hub";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardActionsHub({
  businessType,
  basePath = "/dashboard",
  previewOnly = false,
}: {
  businessType: string;
  basePath?: string;
  previewOnly?: boolean;
}) {
  const { labels } = useAppLocale();
  const [customersOpen, setCustomersOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const showStoreHub = businessType === "STORE";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden py-3 text-center sm:py-4">
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col justify-start gap-3 overflow-y-auto overflow-x-hidden pb-2">
        <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
          <div className="grid grid-cols-2 gap-2">
            <DashboardActionSquare
              onClick={() => setCustomersOpen(true)}
              icon={Users}
              label={labels.customers}
            />
            {showStoreHub ? (
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
        <DashboardCustomersHubGrid basePath={basePath} />
      </DashboardActionSheet>

      {showStoreHub && (
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
      )}
    </div>
  );
}
