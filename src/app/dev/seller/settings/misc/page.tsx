import { DEV_PREVIEW_ORDERS, DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardMiscExtras } from "@/components/dashboard/dashboard-misc-extras";

export default function DevSellerSettingsMiscPage() {
  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell
          businessType="STORE"
          basePath="/dev/seller"
          storeLocale={DEV_STORE_BUSINESS.storeLocale}
          storeTheme={DEV_STORE_BUSINESS.storeTheme}
        >
          <div className="space-y-4">
            <DashboardSettingsBackLink basePath="/dev/seller" />
            <DashboardMiscExtras
              basePath="/dev/seller"
              previewOnly
              initialOrderConfirmationRequired
              previewOrders={DEV_PREVIEW_ORDERS}
            />
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}
