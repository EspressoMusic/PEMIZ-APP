import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProductsManager } from "@/components/dashboard/products-manager";

export default function DevSellerProductsPage() {
  return (
    <DashboardShell
      businessType="STORE"
      basePath="/dev/seller"
      storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <DashboardActionsBackLink basePath="/dev/seller" />
        <div className="min-h-0 flex-1 overflow-hidden">
          <ProductsManager />
        </div>
      </div>
    </DashboardShell>
  );
}
