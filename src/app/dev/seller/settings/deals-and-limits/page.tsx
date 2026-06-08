import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardDealsAndLimitsHub } from "@/components/dashboard/dashboard-deals-and-limits-hub";

export default function DevSellerSettingsDealsAndLimitsPage() {
  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell
          businessType="STORE"
          basePath="/dev/seller"
          storeLocale={DEV_STORE_BUSINESS.storeLocale}
          storeTheme={DEV_STORE_BUSINESS.storeTheme}
        >
          <DashboardDealsAndLimitsHub basePath="/dev/seller" />
        </DashboardShell>
      </div>
    </div>
  );
}
