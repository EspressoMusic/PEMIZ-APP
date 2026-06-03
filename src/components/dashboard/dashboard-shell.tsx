import type { ReactNode } from "react";
import { DashboardShellClient } from "@/components/dashboard/dashboard-shell-client";

export function DashboardShell({
  children,
  businessType,
  basePath = "/dashboard",
  storeLocale = "he",
  storeTheme = "calm",
}: {
  children: ReactNode;
  businessType: string;
  basePath?: string;
  storeLocale?: string | null;
  storeTheme?: string | null;
}) {
  return (
    <DashboardShellClient
      businessType={businessType}
      basePath={basePath}
      storeLocale={storeLocale}
      storeTheme={storeTheme}
    >
      {children}
    </DashboardShellClient>
  );
}
