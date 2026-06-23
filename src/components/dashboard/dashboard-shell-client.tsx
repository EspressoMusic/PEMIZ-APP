"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { AppointmentStoreWelcomeSetup } from "@/components/dashboard/appointment-store-welcome-setup";
import { SellerWelcomeGuide } from "@/components/dashboard/seller-welcome-guide";
import { SELLER_WELCOME_GUIDE_ENABLED } from "@/lib/seller-welcome-guide-enabled";
import { isAppointmentStoreScheduleConfigured } from "@/lib/appointment-store-setup";
import { DashboardPlatformMessageBanner } from "@/components/dashboard/dashboard-platform-message-banner";
import { PwaInstallBanner } from "@/components/pwa/pwa-install-banner";
import {
  AppLocaleProvider,
  useAppLocale,
} from "@/components/dashboard/app-locale-provider";
import { DashboardUiPreferencesProvider } from "@/components/dashboard/dashboard-ui-preferences";
import { StoreThemeProvider } from "@/components/dashboard/store-theme-provider";
import { useDashboardHub } from "@/components/dashboard/dashboard-hub-context";
import {
  DASHBOARD_MOBILE_STACK,
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";

function DashboardPwaInstallBanner() {
  const { labels } = useAppLocale();
  return (
    <PwaInstallBanner
      surface="dashboard"
      copy={{
        title: labels.installAppBannerTitle,
        hint: labels.installAppBannerHint,
        install: labels.installAppBannerInstall,
        dismiss: labels.installAppBannerDismiss,
      }}
    />
  );
}

function isSellerAppRoute(pathname: string, basePath: string) {
  return (
    pathname === basePath ||
    pathname === `${basePath}/` ||
    pathname.startsWith(`${basePath}/`)
  );
}

function isDashboardHomeRoute(pathname: string, basePath: string) {
  return pathname === basePath || pathname === `${basePath}/`;
}

function isDashboardActionsHubRoute(pathname: string, basePath: string) {
  return (
    pathname === `${basePath}/actions` ||
    pathname === `${basePath}/actions/`
  );
}

export function DashboardShellClient({
  children,
  businessType,
  businessId,
  basePath = "/dashboard",
  storeLocale = "he",
  storeTheme = "calm",
  orderScheduleEnabled = false,
  orderSchedule = null,
  platformOwnerMessage = null,
  platformOwnerMessageAt = null,
  platformOwnerMessageReadAt = null,
}: {
  children: ReactNode;
  businessType: string;
  businessId: string;
  basePath?: string;
  storeLocale?: string | null;
  storeTheme?: string | null;
  orderScheduleEnabled?: boolean;
  orderSchedule?: string | null;
  platformOwnerMessage?: string | null;
  platformOwnerMessageAt?: string | null;
  platformOwnerMessageReadAt?: string | null;
}) {
  const pathname = usePathname();
  const hub = useDashboardHub();
  const inSellerApp = isSellerAppRoute(pathname, basePath);
  const isHomeRoute = isDashboardHomeRoute(pathname, basePath);
  const isActionsHubRoute = isDashboardActionsHubRoute(pathname, basePath);
  const lockMainScroll =
    Boolean(hub) || isHomeRoute || isActionsHubRoute;
  const tourEnabled = SELLER_WELCOME_GUIDE_ENABLED;
  const appointmentScheduleConfigured = isAppointmentStoreScheduleConfigured({
    businessType,
    orderScheduleEnabled,
    orderSchedule,
  });

  useEffect(() => {
    if (!inSellerApp) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [inSellerApp]);

  const shellBody = (
    <div className="dashboard-surface flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div
        className="dashboard-shell-main min-h-0 min-w-0 flex-1 overflow-hidden pb-[calc(92px+max(10px,env(safe-area-inset-bottom)))]"
      >
        <div
          className={`${DASHBOARD_MOBILE_STACK} ${DASHBOARD_PAGE_ROOT} min-h-0 flex-1`}
        >
          <div
            className={`no-scrollbar min-h-0 flex-1 overscroll-contain ${
              lockMainScroll
                ? "flex flex-col overflow-hidden pb-0"
                : `${DASHBOARD_SCROLL_MAIN} pb-[max(1rem,env(safe-area-inset-bottom))]`
            }`}
          >
            {inSellerApp ? (
              <DashboardPlatformMessageBanner
                initialMessage={platformOwnerMessage}
                initialMessageAt={platformOwnerMessageAt}
                initialReadAt={platformOwnerMessageReadAt}
                previewOnly={businessId === "dev-preview"}
              />
            ) : null}
            {children}
          </div>
        </div>
      </div>
      <DashboardNav businessType={businessType} basePath={basePath} />
      {inSellerApp ? <DashboardPwaInstallBanner /> : null}
    </div>
  );

  return (
    <AppLocaleProvider initialLocale={storeLocale}>
      <StoreThemeProvider initialTheme={storeTheme}>
        <DashboardUiPreferencesProvider>
          {inSellerApp && tourEnabled ? (
            <SellerWelcomeGuide
              businessId={businessId}
              businessType={businessType}
              basePath={basePath}
              appointmentScheduleConfigured={appointmentScheduleConfigured}
            >
              {shellBody}
            </SellerWelcomeGuide>
          ) : (
            shellBody
          )}
          {inSellerApp ? (
            <AppointmentStoreWelcomeSetup
              businessId={businessId}
              businessType={businessType}
              basePath={basePath}
              orderScheduleEnabled={orderScheduleEnabled}
              orderSchedule={orderSchedule}
            />
          ) : null}
        </DashboardUiPreferencesProvider>
      </StoreThemeProvider>
    </AppLocaleProvider>
  );
}
