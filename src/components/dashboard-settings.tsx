"use client";

import { Bell, LogOut, CircleAlert, Smartphone, Star } from "lucide-react";
import {
  DashboardActionRow,
  DashboardActionRowButton,
} from "@/components/dashboard/dashboard-action-row";
import { DashboardDeleteStoreSection } from "@/components/dashboard/dashboard-delete-store-section";
import { DashboardStoreCustomers } from "@/components/dashboard/dashboard-store-customers";
import { DashboardStorePanelsSettingsGroup } from "@/components/dashboard/dashboard-store-panels-settings";
import { DashboardSubscriptionSection } from "@/components/dashboard/dashboard-subscription-section";
import type { DashboardOrderView } from "@/components/dashboard/dashboard-order-card";
import {
  DEFAULT_STORE_PANELS_VISIBLE,
  type StorePanelsVisible,
} from "@/lib/store-panels-visible";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { useNativeApp } from "@/hooks/use-native-app";

type Props = {
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
  const nativeApp = useNativeApp();
  const showStoreQuickLinks =
    showQuickActionRows &&
    (businessType === "STORE" ||
      businessType === "APPOINTMENTS" ||
      businessType === "RENTAL");

  return (
    <div className="space-y-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
          <ul className="space-y-2 text-start">
            {businessType === "STORE" ||
            businessType === "APPOINTMENTS" ||
            businessType === "RENTAL" ? (
              <DashboardStorePanelsSettingsGroup
                initial={initialStorePanels}
                previewOnly={previewOnly}
                businessType={businessType}
              />
            ) : null}

            <DashboardActionRow
              href={`${basePath}/customers/reviews`}
              icon={Star}
              title={labels.reviewsTitle}
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
                {!nativeApp ? (
                  <DashboardActionRow
                    href={`${basePath}/settings/app`}
                    icon={Smartphone}
                    title={labels.installApp}
                  />
                ) : null}
              </>
            ) : null}

            <DashboardSubscriptionSection
              embedded
              previewOnly={previewOnly}
            />

            <DashboardActionRowButton
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              icon={LogOut}
              title={labels.logoutTitle}
            />

            <DashboardDeleteStoreSection
              embedded
              businessName={businessName}
              previewOnly={previewOnly}
            />
          </ul>
        </div>
    </div>
  );
}
