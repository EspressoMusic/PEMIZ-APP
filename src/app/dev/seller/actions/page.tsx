import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";

export default function DevSellerActionsPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller">
          <DashboardActionsHub
            businessType="STORE"
            basePath="/dev/seller"
            storeTheme={DEV_STORE_BUSINESS.storeTheme}
            storeLocale={DEV_STORE_BUSINESS.storeLocale}
            previewOnly
          />
        </DashboardShell>
      </div>
    </div>
  );
}
