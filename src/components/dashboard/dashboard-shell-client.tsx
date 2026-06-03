"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardUiPreferencesProvider } from "@/components/dashboard/dashboard-ui-preferences";
import { AppLocaleProvider } from "@/components/dashboard/app-locale-provider";
import { StoreThemeProvider } from "@/components/dashboard/store-theme-provider";
import {
  DASHBOARD_MOBILE_STACK,
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_VIEWPORT_HEIGHT,
} from "@/components/dashboard/dashboard-panel-frame";

function isSellerAppRoute(pathname: string, basePath: string) {
  return (
    pathname === basePath ||
    pathname === `${basePath}/` ||
    pathname.startsWith(`${basePath}/`)
  );
}

export function DashboardShellClient({
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
  const pathname = usePathname();
  const inSellerApp = isSellerAppRoute(pathname, basePath);

  useEffect(() => {
    if (!inSellerApp) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [inSellerApp]);

  return (
    <AppLocaleProvider initialLocale={storeLocale}>
      <StoreThemeProvider initialTheme={storeTheme}>
      <DashboardUiPreferencesProvider>
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        <div
          className={`min-w-0 overflow-hidden ${DASHBOARD_VIEWPORT_HEIGHT} ${
            inSellerApp ? "" : "pb-[calc(76px+env(safe-area-inset-bottom))]"
          }`}
        >
          <div className={`${DASHBOARD_MOBILE_STACK} ${DASHBOARD_PAGE_ROOT}`}>
            {children}
          </div>
        </div>
        <DashboardNav businessType={businessType} basePath={basePath} />
        </div>
      </DashboardUiPreferencesProvider>
      </StoreThemeProvider>
    </AppLocaleProvider>
  );
}
