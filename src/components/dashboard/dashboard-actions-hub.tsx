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
import type { AppointmentCalendarConfig } from "@/lib/appointment-slot-generator";

export function DashboardActionsHub({
  businessType,
  basePath = "/dashboard",
  previewOnly = false,
  previewAppointments = [] as DashboardAppointmentView[],
  previewBookingByDay = false,
  initialStoreTerms = null,
  initialCalendarConfig,
  initialWorkingDays,
  /** Open a panel immediately — e.g. landing on /dashboard/customers directly, so the actions grid still shows behind it. */
  initialOpenPanel,
}: {
  businessType: string;
  basePath?: string;
  previewOnly?: boolean;
  previewAppointments?: DashboardAppointmentView[];
  previewBookingByDay?: boolean;
  initialStoreTerms?: string | null;
  initialCalendarConfig?: AppointmentCalendarConfig;
  initialWorkingDays?: {
    initialEnabled: boolean;
    initialScheduleJson: string | null;
  };
  initialOpenPanel?: "customers" | "store";
}) {
  const { labels } = useAppLocale();
  const [customersOpen, setCustomersOpen] = useState(
    initialOpenPanel === "customers"
  );
  const [storeOpen, setStoreOpen] = useState(initialOpenPanel === "store");
  const showStoreHub = businessType === "STORE";
  const showAppointmentsHub = isScheduleLikeBusinessType(businessType);

  return (
    <div className="flex h-full min-h-0 flex-col justify-start overflow-hidden px-3 py-3 text-center sm:py-4">
      <div className="flex shrink-0 flex-col gap-3">
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
              initialStoreTerms={initialStoreTerms}
            />
          </ul>
        </div>
      </div>

      <DashboardActionSheet
        open={customersOpen}
        onClose={() => setCustomersOpen(false)}
        ariaLabel={labels.customers}
        placement="center"
        showBackButton
        backButtonLabel={labels.backToActions}
        compact
        fitContent
      >
        <DashboardCustomersHubGrid basePath={basePath} embedded />
      </DashboardActionSheet>

      {showStoreHub ? (
        <DashboardActionSheet
          open={storeOpen}
          onClose={() => setStoreOpen(false)}
          ariaLabel={labels.store}
          placement="center"
          showBackButton
          backButtonLabel={labels.backToActions}
          compact
          fitContent
        >
          <DashboardStoreSettingsHubPanel basePath={basePath} embedded />
        </DashboardActionSheet>
      ) : null}
      {showAppointmentsHub ? (
        <DashboardActionSheet
          open={storeOpen}
          onClose={() => setStoreOpen(false)}
          ariaLabel={labels.store}
          placement="center"
          showBackButton
          backButtonLabel={labels.backToActions}
          compact
          fitContent
        >
          <DashboardAppointmentsSettingsHubPanel
            basePath={basePath}
            embedded
            previewOnly={previewOnly}
            previewAppointments={previewAppointments}
            previewBookingByDay={previewBookingByDay}
            initialCalendarConfig={initialCalendarConfig}
            initialWorkingDays={initialWorkingDays}
          />
        </DashboardActionSheet>
      ) : null}
    </div>
  );
}
