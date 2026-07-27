import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";
import { demoPrepSummary } from "@/lib/dashboard-prep-summary";
import {
  DEV_PREVIEW_ORDERS,
  DEV_STORE_BUSINESS,
  DEV_STORE_OWNER_NAME,
} from "@/lib/dev-preview-data";

export default async function DevSellerPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale: localeParam } = await searchParams;
  // Dev-only override — e.g. ?locale=en — to preview this page in a
  // language other than the fixture's default.
  const storeLocale =
    localeParam === "en" || localeParam === "he"
      ? localeParam
      : DEV_STORE_BUSINESS.storeLocale;

  return (
    <DashboardShell
      businessType="STORE"
      basePath="/dev/seller"
      storeLocale={storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}
    >
          <DashboardHomeView
            ownerName={DEV_STORE_OWNER_NAME}
            businessSlug="demo-store"
            basePath="/dev/seller"
            customerLink="/b/demo-store"
            previewHref="/dev/customer"
            showPrepSummary
            prepProducts={demoPrepSummary()}
            initialOrders={DEV_PREVIEW_ORDERS.filter(
              (order) => order.status === "PENDING"
            )}
            prepRefreshFromApi={false}
            inquiriesHref="/dev/seller/customers/inquiries"
            inquiryBellPreview
          />
    </DashboardShell>
  );
}
