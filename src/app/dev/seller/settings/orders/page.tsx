import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { OrdersManager } from "@/components/dashboard-client";
import { DEV_PREVIEW_ORDERS, DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";

export default function DevSellerSettingsOrdersPage() {
  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller" storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}>
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            <DashboardSettingsBackLink basePath="/dev/seller" />
            <div className="min-h-0 flex-1 overflow-hidden">
              <OrdersManager
                previewOnly
                previewOrders={DEV_PREVIEW_ORDERS}
              />
            </div>
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}
