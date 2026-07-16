"use client";

import { User } from "lucide-react";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { DashboardStoreStylePicker } from "@/components/dashboard/dashboard-store-style-picker";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardAccountSettingsGroup({
  basePath = "/dashboard",
  previewOnly = false,
  businessType = "STORE",
}: {
  basePath?: string;
  previewOnly?: boolean;
  businessType?: string;
}) {
  const { labels } = useAppLocale();

  return (
    <>
      <DashboardStoreStylePicker
        previewOnly={previewOnly}
        businessType={businessType}
        basePath={basePath}
      />
      <DashboardActionRow
        href={`${basePath}/settings/account`}
        icon={User}
        title={labels.accountAndLink}
      />
    </>
  );
}
