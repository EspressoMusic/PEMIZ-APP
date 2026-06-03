import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardSalesStats } from "@/components/dashboard/dashboard-sales-stats";

export default function DevSellerSalesStatsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller">
          <DashboardSalesStats
            backHref="/dev/seller/actions"
            previewOnly
          />
        </DashboardShell>
      </div>
    </div>
  );
}
