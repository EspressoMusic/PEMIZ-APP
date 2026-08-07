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
            initialOrderConfirmationRequired={false}
            initialOrders={[
              {
                id: "demo-order-1",
                orderNumber: 501,
                customerName: "מיכל כהן",
                customerPhone: "0501234567",
                status: "CONFIRMED",
                statusLabel: "אושר",
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                customerAddress: "הרצל 12, תל אביב",
                items: [
                  { name: "Chocolate Cake", quantity: 1, lineTotal: 99, imageUrl: null },
                  { name: "Croissant", quantity: 3, lineTotal: 54, imageUrl: null },
                ],
              },
              {
                id: "demo-order-2",
                orderNumber: 502,
                customerName: "דני לוי",
                customerPhone: "0529876543",
                status: "CONFIRMED",
                statusLabel: "אושר",
                createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
                items: [
                  { name: "Sourdough Bread", quantity: 2, lineTotal: 60, imageUrl: null },
                ],
              },
              ...DEV_PREVIEW_ORDERS.filter((order) => order.status === "PENDING"),
            ]}
            prepRefreshFromApi={false}
            inquiriesHref="/dev/seller/customers/inquiries"
            inquiryBellPreview
          />
    </DashboardShell>
  );
}
