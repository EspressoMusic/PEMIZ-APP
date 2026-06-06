"use client";

import { PageTitle } from "@/components/ui";
import { PwaInstallPanel } from "@/components/pwa/pwa-install-panel";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";

export function DashboardInstallAppPage({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const { labels } = useAppLocale();

  return (
    <div className="space-y-4">
      <DashboardSettingsBackLink basePath={basePath} />
      <PageTitle>{labels.installApp}</PageTitle>
      <PwaInstallPanel
        copy={{
          title: labels.installAppTitle,
          subtitle: labels.installAppSubtitle,
          installedTitle: labels.installAppInstalledTitle,
          installedHint: labels.installAppInstalledHint,
          installButton: labels.installAppButton,
          iosStep1: labels.installAppIosStep1,
          iosStep2: labels.installAppIosStep2,
          iosStep3: labels.installAppIosStep3,
          androidHint: labels.installAppAndroidHint,
          desktopHint: labels.installAppDesktopHint,
        }}
      />
    </div>
  );
}
