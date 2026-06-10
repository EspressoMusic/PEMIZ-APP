"use client";

import { useState } from "react";
import { Store, Users } from "lucide-react";
import { DashboardActionsSettingsGroup } from "@/components/dashboard/dashboard-actions-settings-group";
import { DashboardActionSquare } from "@/components/dashboard/dashboard-action-square";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardCustomersHubGrid } from "@/components/dashboard/dashboard-customers-hub";
import { DashboardStoreSettingsHubPanel } from "@/components/dashboard/dashboard-store-settings-hub";
import { DashboardAppointmentsSettingsHubPanel } from "@/components/dashboard/dashboard-appointments-settings-hub";
import type { DashboardAppointmentView } from "@/components/dashboard/dashboard-appointment-card";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { isScheduleLikeBusinessType } from "@/lib/types";

export function DashboardActionsHub({
  businessType,
  basePath = "/dashboard",
  previewOnly = false,
  previewAppointments = [] as DashboardAppointmentView[],
  previewBookingByDay = false,
}: {
  businessType: string;
  basePath?: string;
  previewOnly?: boolean;
  previewAppointments?: DashboardAppointmentView[];
  previewBookingByDay?: boolean;
}) {
  const { labels } = useAppLocale();
  const [customersOpen, setCustomersOpen] = useState(false);
  const [storeOpen, setStoreOpen] = useState(false);
  const showStoreHub = businessType === "STORE";
  const showAppointmentsHub = isScheduleLikeBusinessType(businessType);

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
        backButtonLabel={labels.backToActions}
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
            previewOnly={previewOnly}
            previewAppointments={previewAppointments}
            previewBookingByDay={previewBookingByDay}
          />
        </DashboardActionSheet>
      ) : null}
    </div>
  );
}
