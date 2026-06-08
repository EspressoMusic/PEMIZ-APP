"use client";



import Link from "next/link";

import { AppLocaleProvider } from "@/components/dashboard/app-locale-provider";

import { SellerWelcomeGuide } from "@/components/dashboard/seller-welcome-guide";

import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";

import { DashboardNav } from "@/components/dashboard-nav";



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



  return (

    <AppLocaleProvider initialLocale="he">

      <SellerWelcomeGuide

        businessId={storageId}

        businessType={businessType}

        basePath={basePath}

        forceStart

      >

        <div className="dashboard-surface bakery-frame-bg relative mx-auto flex h-dvh w-full max-w-lg flex-col">

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

          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[calc(84px+max(8px,env(safe-area-inset-bottom)))]">

            <DashboardActionsHub

              businessType={businessType}

              basePath={basePath}

              previewOnly

            />

          </div>

          <DashboardNav businessType={businessType} basePath={basePath} />

        </div>

      </SellerWelcomeGuide>

    </AppLocaleProvider>

  );

}

