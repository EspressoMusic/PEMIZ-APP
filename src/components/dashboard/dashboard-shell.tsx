import type { ReactNode } from "react";
import { DashboardShellClient } from "@/components/dashboard/dashboard-shell-client";

export function DashboardShell({
  children,
  businessType,
  businessId,
  basePath = "/dashboard",
  storeLocale = "he",
  storeTheme = "turquoise",
  storeDecoration = "none",
  orderScheduleEnabled = false,
  orderSchedule = null,
  initialActiveServiceCount = 0,
  platformOwnerMessage = null,
  platformOwnerMessageAt = null,
  platformOwnerMessageReadAt = null,
  storePanelsVisible = null,
}: {
  children: ReactNode;
  businessType: string;
  businessId?: string;
  basePath?: string;
  storeLocale?: string | null;
  storeTheme?: string | null;
  storeDecoration?: string | null;
  orderScheduleEnabled?: boolean;
  orderSchedule?: string | null;
  initialActiveServiceCount?: number;
  platformOwnerMessage?: string | null;
  platformOwnerMessageAt?: string | null;
  platformOwnerMessageReadAt?: string | null;
  storePanelsVisible?: string | null;
}) {
  return (
    <DashboardShellClient
      businessType={businessType}
      businessId={businessId ?? "dev-preview"}
      basePath={basePath}
      storeLocale={storeLocale}
      storeTheme={storeTheme}
      storeDecoration={storeDecoration}
      orderScheduleEnabled={orderScheduleEnabled}
      orderSchedule={orderSchedule}
      initialActiveServiceCount={initialActiveServiceCount}
      platformOwnerMessage={platformOwnerMessage}
      platformOwnerMessageAt={platformOwnerMessageAt}
      platformOwnerMessageReadAt={platformOwnerMessageReadAt}
      storePanelsVisible={storePanelsVisible}
    >
      {children}
    </DashboardShellClient>
  );
}
