import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { DashboardShellClient } from "@/components/dashboard/dashboard-shell-client";
import {
  DASHBOARD_LOCALE_COOKIE,
  parseLocaleCookie,
} from "@/lib/dashboard-appearance-boot";

export async function DashboardShell({
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
  const cookieStore = await cookies();
  const cookieLocale = parseLocaleCookie(
    cookieStore.get(DASHBOARD_LOCALE_COOKIE)?.value
  );
  const resolvedLocale = cookieLocale ?? storeLocale ?? "he";

  return (
    <DashboardShellClient
      businessType={businessType}
      businessId={businessId ?? "dev-preview"}
      basePath={basePath}
      storeLocale={resolvedLocale}
      storeTheme={storeTheme}
    >
      {children}
    </DashboardShellClient>
  );
}
