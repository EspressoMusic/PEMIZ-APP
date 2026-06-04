import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardCustomersHub } from "@/components/dashboard/dashboard-customers-hub";

export default function DevSellerCustomersPage() {
  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller" storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}>
          <div className="space-y-4">
            <DashboardActionsBackLink basePath="/dev/seller" />
            <DashboardCustomersHub basePath="/dev/seller" />
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}
