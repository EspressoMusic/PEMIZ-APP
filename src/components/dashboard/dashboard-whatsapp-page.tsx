"use client";

import { PageTitle } from "@/components/ui";
import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardWhatsAppSettings } from "@/components/dashboard/dashboard-whatsapp-settings";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardWhatsAppPage({
  initialEnabled,
  initialPhone,
  ownerPhone,
  serverConfigured,
  previewOnly = false,
  basePath = "/dashboard",
}: {
  initialEnabled: boolean;
  initialPhone: string;
  ownerPhone: string;
  serverConfigured: boolean;
  previewOnly?: boolean;
  basePath?: string;
}) {
  const { labels } = useAppLocale();

  return (
    <div className="space-y-5 pb-2 text-center">
      <DashboardActionsBackLink basePath={basePath} />
      <PageTitle>{labels.whatsappAlerts}</PageTitle>
      <DashboardWhatsAppSettings
        initialEnabled={initialEnabled}
        initialPhone={initialPhone}
        ownerPhone={ownerPhone}
        serverConfigured={serverConfigured}
        previewOnly={previewOnly}
      />
    </div>
  );
}
