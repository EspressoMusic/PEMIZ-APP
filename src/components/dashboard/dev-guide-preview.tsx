"use client";

import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SellerWelcomeGuide } from "@/components/dashboard/seller-welcome-guide";
import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_STORE_BUSINESS,
  getDevPreviewAppointmentsSeller,
} from "@/lib/dev-preview-data";

export function DevGuidePreview({
  businessType,
  title,
  basePath,
  storageId,
}: {
  businessType: "STORE" | "APPOINTMENTS";
  title: string;
  basePath: string;
  storageId: string;
}) {
  const other =
    businessType === "STORE"
      ? { href: "/dev/guide/appointments", label: "מדריך חנות פגישות" }
      : { href: "/dev/guide", label: "מדריך חנות מוצרים" };

  const storeMeta =
    businessType === "STORE" ? DEV_STORE_BUSINESS : DEV_APPOINTMENTS_BUSINESS;

  return (
    <DashboardShell
      businessType={businessType}
      businessId={storageId}
      basePath={basePath}
      storeLocale={storeMeta.storeLocale}
      storeTheme={storeMeta.storeTheme}
      orderScheduleEnabled={storeMeta.orderScheduleEnabled ?? false}
      orderSchedule={storeMeta.orderSchedule ?? null}
    >
      <SellerWelcomeGuide
        businessId={storageId}
        businessType={businessType}
        basePath={basePath}
        forceStart
        appointmentScheduleConfigured
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b border-bakery-border/25 px-4 py-2 text-center">
            <p className="text-[12px] font-bold text-bakery-muted">{title}</p>
            <p className="mt-1 text-[11px] text-bakery-muted">
              תצוגה מקדימה — חלון הסבר בפתיחה
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
                href={`${businessType === "STORE" ? "/dev/guide" : "/dev/guide/appointments"}?reset=1`}
                className="text-[13px] font-bold text-bakery-muted hover:text-bakery-ink hover:underline"
              >
                הצג מדריך שוב
              </Link>
            </div>
          </div>

          <DashboardActionsHub
            businessType={businessType}
            basePath={basePath}
            previewOnly
            previewAppointments={
              businessType === "APPOINTMENTS"
                ? getDevPreviewAppointmentsSeller()
                : undefined
            }
            previewBookingByDay={
              businessType === "APPOINTMENTS"
                ? (DEV_APPOINTMENTS_BUSINESS.appointmentBookingByDay ?? false)
                : false
            }
          />
        </div>
      </SellerWelcomeGuide>
    </DashboardShell>
  );
}
