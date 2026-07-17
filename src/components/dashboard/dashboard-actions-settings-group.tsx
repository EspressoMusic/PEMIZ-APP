"use client";

import { useState } from "react";
import { ChevronDown, Settings, TrendingUp, User } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  DASHBOARD_ACTION_ROW_CLASS,
  DashboardActionRow,
} from "@/components/dashboard/dashboard-action-row";
import { getDashboardPressProps } from "@/lib/dashboard-press";
import { DashboardAccountSettingsGroup } from "@/components/dashboard/dashboard-account-settings-group";
import { DashboardAppointmentCancelSettings } from "@/components/dashboard/dashboard-appointment-cancel-settings";
import { DashboardStoreStylePicker } from "@/components/dashboard/dashboard-store-style-picker";
import { isScheduleLikeBusinessType } from "@/lib/types";

export function DashboardActionsSettingsGroup({
  basePath = "/dashboard",
  previewOnly = false,
  businessType = "STORE",
  initialStoreTerms = null,
  initialOrderConfirmationRequired = true,
}: {
  basePath?: string;
  previewOnly?: boolean;
  businessType?: string;
  initialStoreTerms?: string | null;
  initialOrderConfirmationRequired?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();

  return (
    <li className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="dashboard-settings-items"
        data-tour-id="tour-settings-row"
        className={`${DASHBOARD_ACTION_ROW_CLASS}${
          open ? " bakery-float-tile--active" : ""
        }`}
        {...getDashboardPressProps<HTMLButtonElement>()}
      >
        <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
          <Settings className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
          {labels.settings}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-bakery-ink transition-transform duration-300 ease-out ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={2.5}
          aria-hidden
        />
      </button>

      <div
        id="dashboard-settings-items"
        className={`dashboard-action-expand ${
          open ? "dashboard-action-expand--open" : "dashboard-action-expand--closed"
        }`}
        aria-hidden={!open}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-2 pt-2 text-start">
            <ul className="space-y-2">
              {businessType === "STORE" ? (
                <DashboardActionRow
                  href={`${basePath}/stats/sales`}
                  icon={TrendingUp}
                  title={labels.salesAndProfit}
                />
              ) : null}
              {isScheduleLikeBusinessType(businessType) ? (
                <>
                  <DashboardStoreStylePicker
                    previewOnly={previewOnly}
                    businessType={businessType}
                    basePath={basePath}
                  />
                  <DashboardAppointmentCancelSettings
                    embedded
                    initialStoreTerms={initialStoreTerms}
                    previewOnly={previewOnly}
                  />
                  <DashboardActionRow
                    href={`${basePath}/settings/account`}
                    icon={User}
                    title={labels.accountAndLink}
                  />
                </>
              ) : (
                <DashboardAccountSettingsGroup
                  basePath={basePath}
                  previewOnly={previewOnly}
                  businessType={businessType}
                  initialOrderConfirmationRequired={initialOrderConfirmationRequired}
                />
              )}
            </ul>
          </div>
        </div>
      </div>
    </li>
  );
}
