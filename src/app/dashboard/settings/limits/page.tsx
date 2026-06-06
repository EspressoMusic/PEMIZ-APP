import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardOrderScheduleSettings } from "@/components/dashboard/dashboard-order-schedule-settings";

export default async function SettingsLimitsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") redirect("/dashboard/settings");

  const b = user.business;

  return (
    <div className="flex flex-col gap-3 pb-2 text-center">
      <div className="px-1 text-start">
        <DashboardSettingsBackLink />
      </div>
      <DashboardOrderScheduleSettings
        initialEnabled={b.orderScheduleEnabled ?? false}
        initialScheduleJson={b.orderSchedule ?? null}
      />
    </div>
  );
}
