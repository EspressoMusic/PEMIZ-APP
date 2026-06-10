import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardStoreSettingsHub } from "@/components/dashboard/dashboard-store-settings-hub";

export default function DevSellerSettingsPage() {
  return (
    <DashboardShell
      businessType="STORE"
      basePath="/dev/seller"
      storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}
    >
      <DashboardStoreSettingsHub basePath="/dev/seller" />
    </DashboardShell>
  );
}
