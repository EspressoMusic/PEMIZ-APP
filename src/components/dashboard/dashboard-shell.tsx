import type { ReactNode } from "react";
import { DashboardShellClient } from "@/components/dashboard/dashboard-shell-client";

export function DashboardShell({
  children,
  businessType,
  businessId,
  basePath = "/dashboard",
  storeLocale = "he",
  storeTheme = "calm",
}: {
  children: ReactNode;
  businessType: string;
  businessId?: string;
  basePath?: string;
  storeLocale?: string | null;
  storeTheme?: string | null;
}) {
  return (
    <DashboardShellClient
      businessType={businessType}
      businessId={businessId ?? "dev-preview"}
      basePath={basePath}
      storeLocale={storeLocale}
      storeTheme={storeTheme}
    >
      {children}
    </DashboardShellClient>
  );
}
