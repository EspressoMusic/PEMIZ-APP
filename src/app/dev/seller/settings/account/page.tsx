import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardSettingsView } from "@/components/dashboard-settings";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";

export default function DevSellerSettingsAccountPage() {
  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller" storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}>
          <div className="space-y-4">
            <DashboardSettingsBackLink basePath="/dev/seller" />
            <DashboardSettingsView
              ownerName="בעל חנות (תצוגה)"
              email="demo@linky.local"
              phone="050-1234567"
              businessName="המאפייה שלי (תצוגה)"
              isActive
              storeUrl="/b/demo-store"
              previewSlug="demo-store"
              previewOnly
            />
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}
