import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageTitle } from "@/components/ui";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-settings-back-link";
import { DashboardOrderScheduleSettings } from "@/components/dashboard/dashboard-order-schedule-settings";

export default function DevSellerSettingsLimitsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller">
          <div className="space-y-5 pb-2 text-center">
            <DashboardSettingsBackLink basePath="/dev/seller" />
            <PageTitle>הגבלות הזמנה</PageTitle>
            <DashboardOrderScheduleSettings
              initialEnabled={false}
              initialScheduleJson={null}
              previewOnly
            />
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}
