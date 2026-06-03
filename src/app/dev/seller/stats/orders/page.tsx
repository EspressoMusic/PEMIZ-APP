import { notFound } from "next/navigation";
import { DEV_STORE_BUSINESS } from "@/lib/dev-preview-data";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardStatsView } from "@/components/dashboard/dashboard-stats-view";
import { demoOrderPoints } from "@/lib/dashboard-stats";

export default function DevSellerOrdersStatsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller" storeLocale={DEV_STORE_BUSINESS.storeLocale}
      storeTheme={DEV_STORE_BUSINESS.storeTheme}>
          <DashboardStatsView
            title="סטטיסטיקת הזמנות"
            unit=""
            points={demoOrderPoints()}
            backHref="/dev/seller/actions"
          />
        </DashboardShell>
      </div>
    </div>
  );
}
