import { DEV_PREVIEW_ORDERS, DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardSettingsView } from "@/components/dashboard-settings";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";

export default function DevSellerSettingsAccountPage() {
  return (
    <DashboardShell
      businessType="STORE"
      basePath="/dev/seller"
      storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}
    >
      <div className="space-y-4">
        <DashboardSettingsBackLink basePath="/dev/seller" />
        <DashboardSettingsView
          businessName="המאפייה שלי (תצוגה)"
          isActive
          previewOnly
          basePath="/dev/seller"
          showQuickActionRows
          previewCustomerOrders={DEV_PREVIEW_ORDERS}
        />
      </div>
    </DashboardShell>
  );
}
