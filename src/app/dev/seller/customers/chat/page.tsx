import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardSellerChatManager } from "@/components/dashboard/dashboard-seller-chat-manager";
import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";

export default function DevSellerCustomersChatPage() {
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
            <DashboardCustomersBackLink basePath="/dev/seller" />
            <DashboardSellerChatManager
              isDevPreview
              businessSlug="demo-store"
              businessName={DEV_STORE_BUSINESS.name}
            />
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}
