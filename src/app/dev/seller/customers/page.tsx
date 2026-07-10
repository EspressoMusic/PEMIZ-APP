import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";

export default function DevSellerCustomersPage() {
  return (
    <DashboardShell
      businessType="STORE"
      basePath="/dev/seller"
      storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}
    >
      <DashboardActionsHub
        businessType="STORE"
        basePath="/dev/seller"
        initialOpenPanel="customers"
      />
    </DashboardShell>
  );
}
