"use client";

import { User } from "lucide-react";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { DashboardStoreStylePicker } from "@/components/dashboard/dashboard-store-style-picker";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardAccountSettingsGroup({
  basePath = "/dashboard",
  previewOnly = false,
  businessType = "STORE",
  initialOrderConfirmationRequired = true,
}: {
  basePath?: string;
  previewOnly?: boolean;
  businessType?: string;
  initialOrderConfirmationRequired?: boolean;
}) {
  const { labels } = useAppLocale();

  return (
    <>
      <DashboardStoreStylePicker
        previewOnly={previewOnly}
        businessType={businessType}
        basePath={basePath}
        initialOrderConfirmationRequired={initialOrderConfirmationRequired}
      />
      <DashboardActionRow
        href={`${basePath}/settings/account`}
        icon={User}
        title={labels.accountAndLink}
      />
    </>
  );
}
