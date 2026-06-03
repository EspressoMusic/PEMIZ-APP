import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";
import { demoPrepSummary } from "@/lib/dashboard-prep-summary";

export default function DevSellerPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller">
          <DashboardHomeView
            businessName="המאפייה שלי (תצוגה)"
            customerLink="/b/demo-store"
            previewHref="/dev/customer"
            previewLabel="תצוגת לקוח →"
            pendingOrders={3}
            inquiries={1}
            isActive
            showOrders
            showAppointments={false}
            showPrepSummary
            prepProducts={demoPrepSummary()}
            ordersHref="/dev/seller/customers"
            inquiriesHref="/dev/seller/customers"
          />
        </DashboardShell>
      </div>
    </div>
  );
}
