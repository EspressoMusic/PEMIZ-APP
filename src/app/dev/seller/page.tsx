import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";
import { demoPrepSummary } from "@/lib/dashboard-prep-summary";
import {
  DEV_STORE_BUSINESS,
  DEV_STORE_OWNER_NAME,
} from "@/lib/dev-preview-data";

export default function DevSellerPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <DashboardShell
      businessType="STORE"
      basePath="/dev/seller"
      storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}
    >
          <DashboardHomeView
            ownerName={DEV_STORE_OWNER_NAME}
            businessSlug="demo-store"
            customerLink="/b/demo-store"
            previewHref="/dev/customer"
            showPrepSummary
            prepProducts={demoPrepSummary()}
            prepRefreshFromApi={false}
            inquiriesHref="/dev/seller/customers/inquiries"
            ordersHref="/dev/seller/settings/orders"
            inquiryBellPreview
            storeHealthPreview
          />
    </DashboardShell>
  );
}
