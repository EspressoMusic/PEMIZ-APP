"use client";

import { DashboardPrepSummary } from "@/components/dashboard/dashboard-prep-summary";
import { DashboardInquiryBell } from "@/components/dashboard/dashboard-inquiry-bell";
import { DashboardCustomerLinkCard } from "@/components/dashboard/dashboard-customer-link-card";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import type { PrepProductSummary } from "@/lib/dashboard-prep-summary";

const center = "text-center";
const homeStack = "mx-auto w-full max-w-[360px]";

export function DashboardHomeView({
  ownerName,
  customerLink,
  previewHref,
  prepProducts,
  showPrepSummary,
  prepRefreshFromApi = false,
  businessSlug,
  basePath = "/dashboard",
  inquiriesHref = "/dashboard/customers/inquiries",
  inquiryBellPreview = false,
}: {
  ownerName: string;
  customerLink: string;
  previewHref?: string;
  prepProducts?: PrepProductSummary[];
  showPrepSummary?: boolean;
  prepRefreshFromApi?: boolean;
  businessSlug: string;
  basePath?: string;
  inquiriesHref?: string;
  inquiryBellPreview?: boolean;
}) {
  const { labels } = useAppLocale();

  return (
    <div
      className={`flex h-full min-h-0 w-full flex-col overflow-hidden py-3 sm:py-4 ${center}`}
    >
      <div className={`${homeStack} shrink-0`}>
        <div className="dashboard-home-header">
          <div className="dashboard-home-header__inner relative flex items-center justify-center px-3 py-3.5 pe-14 text-center">
            {ownerName.trim() ? (
              <h1 className="w-full truncate text-center text-[16px] font-extrabold leading-tight text-bakery-ink">
                {labels.hello}, {ownerName.trim()}!
              </h1>
            ) : null}
            <div className="absolute end-3 inset-y-0 flex items-center">
              <DashboardInquiryBell
                businessSlug={businessSlug}
                basePath={basePath}
                inquiriesHref={inquiriesHref}
                previewOnly={inquiryBellPreview}
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${homeStack} mt-2 flex min-h-0 flex-1 flex-col overflow-hidden space-y-2 sm:mt-2.5`}
      >
        {showPrepSummary && prepProducts ? (
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            <DashboardPrepSummary
              initialProducts={prepProducts}
              loadFromApi={prepRefreshFromApi}
              fillHeight
            />
          </div>
        ) : (
          <div className="min-h-0 flex-1" aria-hidden />
        )}
        <div className="shrink-0 pb-1">
          <DashboardCustomerLinkCard
            url={customerLink}
            previewHref={previewHref}
          />
        </div>
      </div>
    </div>
  );
}
