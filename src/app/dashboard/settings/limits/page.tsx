import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PageTitle } from "@/components/ui";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-settings-back-link";
import { DashboardOrderScheduleSettings } from "@/components/dashboard/dashboard-order-schedule-settings";

export default async function SettingsLimitsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") redirect("/dashboard/settings");

  const b = user.business;

  return (
    <div className="space-y-4">
      <DashboardSettingsBackLink />
      <PageTitle>הגבלות הזמנה</PageTitle>
      <DashboardOrderScheduleSettings
        initialEnabled={b.orderScheduleEnabled ?? false}
        initialScheduleJson={b.orderSchedule ?? null}
      />
    </div>
  );
}
