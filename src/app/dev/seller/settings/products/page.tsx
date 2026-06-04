import {
  DEV_PREVIEW_PRODUCTS,
  DEV_STORE_BUSINESS,
} from "@/lib/dev-preview-data";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProductsManager } from "@/components/dashboard/products-manager";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";

export default function DevSellerSettingsProductsPage() {
  return (
    <DashboardShell
      businessType="STORE"
      basePath="/dev/seller"
      storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <DashboardSettingsBackLink basePath="/dev/seller" />
        <div className="min-h-0 flex-1 overflow-hidden">
          <ProductsManager
            previewOnly
            initialProducts={DEV_PREVIEW_PRODUCTS}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
