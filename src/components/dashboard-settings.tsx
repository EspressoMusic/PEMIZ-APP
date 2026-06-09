"use client";

import { Bell, LogOut, CircleAlert, Smartphone } from "lucide-react";
import { PageTitle } from "@/components/ui";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { DashboardDeleteStoreSection } from "@/components/dashboard/dashboard-delete-store-section";
import { DashboardSellerDetailsCard } from "@/components/dashboard/dashboard-seller-details-card";
import { DashboardStoreCustomers } from "@/components/dashboard/dashboard-store-customers";
import { DashboardStorePanelsSettingsGroup } from "@/components/dashboard/dashboard-store-panels-settings";
import { DashboardSubscriptionSection } from "@/components/dashboard/dashboard-subscription-section";
import type { DashboardOrderView } from "@/components/dashboard/dashboard-order-card";
import {
  DEFAULT_STORE_PANELS_VISIBLE,
  type StorePanelsVisible,
} from "@/lib/store-panels-visible";
import {
  DashboardSettingsTile,
  DashboardSettingsTileRow,
} from "@/components/dashboard/dashboard-settings-tile";
import { DASHBOARD_SETTINGS_ACTION } from "@/components/dashboard/dashboard-settings-bar";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

type Props = {
  ownerName: string;
  email: string;
  phone?: string | null;
  businessName?: string;
  isActive: boolean;
  previewOnly?: boolean;
  businessType?: string;
  initialStorePanels?: StorePanelsVisible;
  basePath?: string;
  showQuickActionRows?: boolean;
  previewCustomerOrders?: DashboardOrderView[];
};

export function DashboardSettingsView({
  ownerName,
  email,
  phone,
  businessName,
  isActive,
  previewOnly = false,
  businessType = "STORE",
  initialStorePanels = DEFAULT_STORE_PANELS_VISIBLE,
  basePath = "/dashboard",
  showQuickActionRows = false,
  previewCustomerOrders = [],
}: Props) {
  const { labels } = useAppLocale();
  const showStoreQuickLinks =
    showQuickActionRows &&
    (businessType === "STORE" ||
      businessType === "APPOINTMENTS" ||
      businessType === "RENTAL");

  return (
    <div className="space-y-6 pb-2">
      {!showQuickActionRows ? <PageTitle>{labels.settings}</PageTitle> : null}

      <div className="space-y-2">
        <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
          <ul className="space-y-2 text-start">
            <DashboardSellerDetailsCard
              embedded
              ownerName={ownerName}
              email={email}
              phone={phone}
              businessName={businessName}
              isActive={isActive}
            />

            {!isActive ? (
              <li>
                <div className="flex flex-col items-center gap-2 rounded-[22px] border border-bakery-sale/25 bg-bakery-sale/8 px-3 py-2.5 text-center text-[13px] leading-[1.45] text-bakery-ink sm:flex-row sm:justify-center">
                  <CircleAlert className="h-4 w-4 shrink-0 text-bakery-sale" />
                  <p>{labels.storeInactiveHint}</p>
                </div>
              </li>
            ) : null}

            {showStoreQuickLinks ? (
              <>
                <DashboardStoreCustomers
                  embedded
                  previewOnly={previewOnly}
                  previewOrders={previewCustomerOrders}
                />
                <DashboardActionRow
                  href={`${basePath}/settings/alerts`}
                  icon={Bell}
                  title={labels.alerts}
                />
                <DashboardActionRow
                  href={`${basePath}/settings/app`}
                  icon={Smartphone}
                  title={labels.installApp}
                />
              </>
            ) : null}
          </ul>
        </div>

        {(businessType === "STORE" ||
          businessType === "APPOINTMENTS" ||
          businessType === "RENTAL") && (
          <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
            <ul className="space-y-2 text-start">
              <DashboardStorePanelsSettingsGroup
                initial={initialStorePanels}
                previewOnly={previewOnly}
                businessType={businessType}
              />
            </ul>
          </div>
        )}

        <DashboardSubscriptionSection previewOnly={previewOnly} />

        <DashboardSettingsTile>
          <DashboardSettingsTileRow
            panel={
              <p className="text-[15px] font-extrabold text-bakery-ink">
                {labels.logoutTitle}
              </p>
            }
            action={
              <button
                type="button"
                className={`${DASHBOARD_SETTINGS_ACTION} gap-1.5 border border-bakery-sale/40 bg-bakery-card/60 px-3 text-bakery-sale transition hover:bg-bakery-sale/8 active:scale-[0.99]`}
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
              >
                <LogOut className="h-4 w-4" strokeWidth={2.25} />
                <span className="text-[13px] font-extrabold">{labels.logout}</span>
              </button>
            }
          />
        </DashboardSettingsTile>

        <DashboardDeleteStoreSection
          businessName={businessName}
          previewOnly={previewOnly}
        />
      </div>
    </div>
  );
}
