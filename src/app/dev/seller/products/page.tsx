import { notFound } from "next/navigation";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProductsManager } from "@/components/dashboard/products-manager";

export default function DevSellerProductsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller" storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}>
          <div className="space-y-4">
            <DashboardActionsBackLink basePath="/dev/seller" />
            <ProductsManager />
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}
