"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";
import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";
import { DashboardSettingsView } from "@/components/dashboard-settings";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_APPOINTMENTS_OWNER_NAME,
  DEV_PREVIEW_ORDERS,
  DEV_STORE_BUSINESS,
  DEV_STORE_OWNER_NAME,
  getDevPreviewAppointmentsSeller,
  getDevSellerHomeCalendarPreview,
} from "@/lib/dev-preview-data";
import { demoPrepSummary } from "@/lib/dashboard-prep-summary";
import {
  DEFAULT_STORE_PANELS_VISIBLE,
  storePanelsVisibleToJson,
} from "@/lib/store-panels-visible";

/** Shared layout body for /dev/guide and /dev/guide/appointments — each is its
 * own real route (plus a matching /actions sub-route) so only one screen is
 * ever visible at a time, exactly like the real dashboard's home/actions tabs. */
export function DevGuidePreview({
  businessType,
  title,
  basePath,
  storageId,
  children,
}: {
  businessType: "STORE" | "APPOINTMENTS";
  title: string;
  basePath: string;
  storageId: string;
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const isActionsRoute =
    pathname === `${basePath}/actions` || pathname === `${basePath}/actions/`;
  const isSettingsAccountRoute =
    pathname === `${basePath}/settings/account` ||
    pathname === `${basePath}/settings/account/`;

  const isAppointments = businessType === "APPOINTMENTS";
  const other = isAppointments
    ? { href: "/dev/guide", label: "מדריך חנות מוצרים" }
    : { href: "/dev/guide/appointments", label: "מדריך חנות פגישות" };

  const storeMeta = isAppointments ? DEV_APPOINTMENTS_BUSINESS : DEV_STORE_BUSINESS;
  const orderScheduleEnabled = isAppointments
    ? (DEV_APPOINTMENTS_BUSINESS.orderScheduleEnabled ?? false)
    : false;
  const orderSchedule = isAppointments
    ? (DEV_APPOINTMENTS_BUSINESS.orderSchedule ?? null)
    : null;
  const initialActiveServiceCount = isAppointments
    ? DEV_APPOINTMENTS_BUSINESS.products.length
    : 0;
  const storePanelsVisible = isAppointments
    ? DEFAULT_STORE_PANELS_VISIBLE
    : DEV_STORE_BUSINESS.storePanelsVisible;

  return (
    <DashboardShell
      businessType={businessType}
      businessId={storageId}
      basePath={basePath}
      storeLocale={storeMeta.storeLocale}
      storeTheme={storeMeta.storeTheme}
      orderScheduleEnabled={orderScheduleEnabled}
      orderSchedule={orderSchedule}
      initialActiveServiceCount={initialActiveServiceCount}
      storePanelsVisible={storePanelsVisibleToJson(storePanelsVisible)}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-bakery-border/25 px-4 py-2 text-center">
          <p className="text-[12px] font-bold text-bakery-muted">{title}</p>
          <p className="mt-1 text-[11px] text-bakery-muted">
            תצוגה מקדימה — סיור ההסבר בפתיחה
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dev"
              className="text-[13px] font-bold text-bakery-primary hover:underline"
            >
              חזרה ל-dev
            </Link>
            <Link
              href={other.href}
              className="text-[13px] font-bold text-bakery-muted hover:text-bakery-ink hover:underline"
            >
              {other.label}
            </Link>
            <Link
              href={`${basePath}?reset=1`}
              className="text-[13px] font-bold text-bakery-muted hover:text-bakery-ink hover:underline"
            >
              הצג מדריך שוב
            </Link>
          </div>
        </div>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          {isSettingsAccountRoute ? (
            <div className="px-3 py-3">
              <DashboardSettingsView
                businessName={storeMeta.name}
                isActive
                previewOnly
                businessType={businessType}
                basePath={basePath}
                showQuickActionRows
                initialStorePanels={
                  isAppointments
                    ? DEFAULT_STORE_PANELS_VISIBLE
                    : DEV_STORE_BUSINESS.storePanelsVisible
                }
              />
            </div>
          ) : isActionsRoute ? (
            <DashboardActionsHub
              businessType={businessType}
              basePath={basePath}
              previewOnly
              previewAppointments={
                isAppointments ? getDevPreviewAppointmentsSeller() : undefined
              }
              previewBookingByDay={
                isAppointments
                  ? (DEV_APPOINTMENTS_BUSINESS.appointmentBookingByDay ?? false)
                  : false
              }
            />
          ) : isAppointments ? (
            <DashboardHomeView
              ownerName={DEV_APPOINTMENTS_OWNER_NAME}
              businessSlug="demo-appointments"
              businessType="APPOINTMENTS"
              basePath={basePath}
              customerLink="/dev/customer-appointments"
              previewHref="/dev/customer-appointments"
              inquiriesHref={`${basePath}/customers/inquiries`}
              inquiryBellPreview
              appointmentsCalendarPreview={getDevSellerHomeCalendarPreview()}
            />
          ) : (
            <DashboardHomeView
              ownerName={DEV_STORE_OWNER_NAME}
              businessSlug="demo-store"
              basePath={basePath}
              customerLink="/b/demo-store"
              previewHref="/dev/customer"
              showPrepSummary
              prepProducts={demoPrepSummary()}
              initialOrders={DEV_PREVIEW_ORDERS.filter(
                (order) => order.status === "PENDING"
              )}
              inquiriesHref={`${basePath}/customers/inquiries`}
              inquiryBellPreview
            />
          )}
        </div>
      </div>
      {children}
    </DashboardShell>
  );
}
