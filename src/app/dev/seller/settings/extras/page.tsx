import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardStoreExtras } from "@/components/dashboard/dashboard-store-extras";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";

export default function DevSellerSettingsExtrasPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller" storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}>
          <div className="space-y-4">
            <DashboardSettingsBackLink basePath="/dev/seller" />
            <DashboardStoreExtras
              initialDescription={DEV_STORE_BUSINESS.description}
              previewOnly
            />
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}
