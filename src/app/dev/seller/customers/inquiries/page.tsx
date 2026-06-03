import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardInquiriesManager } from "@/components/dashboard/dashboard-inquiries-manager";
import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-customers-back-link";
import { DEV_PREVIEW_INQUIRIES } from "@/lib/dev-preview-data";

export default function DevSellerCustomersInquiriesPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller">
          <div className="space-y-4">
            <DashboardCustomersBackLink basePath="/dev/seller" />
            <DashboardInquiriesManager
              previewOnly
              initialItems={DEV_PREVIEW_INQUIRIES}
            />
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}
