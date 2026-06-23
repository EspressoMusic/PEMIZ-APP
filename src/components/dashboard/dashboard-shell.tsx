import type { ReactNode } from "react";
import { DashboardShellClient } from "@/components/dashboard/dashboard-shell-client";

export function DashboardShell({
  children,
  businessType,
  businessId,
  basePath = "/dashboard",
  storeLocale = "he",
  storeTheme = "calm",
  orderScheduleEnabled = false,
  orderSchedule = null,
  initialActiveServiceCount = 0,
  platformOwnerMessage = null,
  platformOwnerMessageAt = null,
  platformOwnerMessageReadAt = null,
}: {
  children: ReactNode;
  businessType: string;
  businessId?: string;
  basePath?: string;
  storeLocale?: string | null;
  storeTheme?: string | null;
  orderScheduleEnabled?: boolean;
  orderSchedule?: string | null;
  initialActiveServiceCount?: number;
  platformOwnerMessage?: string | null;
  platformOwnerMessageAt?: string | null;
  platformOwnerMessageReadAt?: string | null;
}) {
  return (
    <DashboardShellClient
      businessType={businessType}
      businessId={businessId ?? "dev-preview"}
      basePath={basePath}
      storeLocale={storeLocale}
      storeTheme={storeTheme}
      orderScheduleEnabled={orderScheduleEnabled}
      orderSchedule={orderSchedule}
      initialActiveServiceCount={initialActiveServiceCount}
      platformOwnerMessage={platformOwnerMessage}
      platformOwnerMessageAt={platformOwnerMessageAt}
      platformOwnerMessageReadAt={platformOwnerMessageReadAt}
    >
      {children}
    </DashboardShellClient>
  );
}
