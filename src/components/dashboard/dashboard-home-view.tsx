"use client";

import { DashboardStoreHealthGauge } from "@/components/dashboard/dashboard-store-health-gauge";
import { DashboardPrepSummary } from "@/components/dashboard/dashboard-prep-summary";
import { DashboardInquiryBell } from "@/components/dashboard/dashboard-inquiry-bell";
import { DashboardCustomerLinkCard } from "@/components/dashboard/dashboard-customer-link-card";
import { DashboardHomeOrdersLink } from "@/components/dashboard/dashboard-home-orders-link";
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
  prepRefreshFromApi = true,
  businessSlug,
  inquiriesHref = "/dashboard/customers/inquiries",
  ordersHref = "/dashboard/settings/orders",
  inquiryBellPreview = false,
  storeHealthPreview = false,
}: {
  ownerName: string;
  customerLink: string;
  previewHref?: string;
  prepProducts?: PrepProductSummary[];
  showPrepSummary?: boolean;
  prepRefreshFromApi?: boolean;
  businessSlug: string;
  inquiriesHref?: string;
  ordersHref?: string;
  inquiryBellPreview?: boolean;
  storeHealthPreview?: boolean;
}) {
  const { labels } = useAppLocale();

  return (
    <div
      className={`flex h-full min-h-0 w-full flex-col overflow-hidden py-3 sm:py-4 ${center}`}
    >
      <div className={`${homeStack} shrink-0 space-y-2.5`}>
        {ownerName.trim() ? (
          <h1 className="truncate px-0.5 text-[17px] font-extrabold leading-tight text-bakery-ink sm:text-[18px]">
            {labels.hello}, {ownerName.trim()}!
          </h1>
        ) : null}
        <div className="flex items-center gap-3">
          <DashboardStoreHealthGauge
            businessSlug={businessSlug}
            inquiriesHref={inquiriesHref}
            previewOnly={storeHealthPreview || inquiryBellPreview}
          />
          <DashboardInquiryBell
            businessSlug={businessSlug}
            inquiriesHref={inquiriesHref}
            previewOnly={inquiryBellPreview}
          />
        </div>
      </div>

      <div
        className={`${homeStack} mt-2 flex min-h-0 flex-1 flex-col overflow-hidden space-y-1.5 sm:mt-3`}
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
        <div className="shrink-0 space-y-1.5">
          <DashboardHomeOrdersLink href={ordersHref} />
          <DashboardCustomerLinkCard
            url={customerLink}
            previewHref={previewHref}
          />
        </div>
      </div>
    </div>
  );
}
