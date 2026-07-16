import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardOrderScheduleSettings } from "@/components/dashboard/dashboard-order-schedule-settings";

export default async function SettingsLimitsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (
    user.business.type !== "STORE" &&
    user.business.type !== "APPOINTMENTS"
  ) {
    redirect("/dashboard/settings");
  }

  if (user.business.type === "APPOINTMENTS") {
    redirect("/dashboard/settings/slots");
  }

  const b = user.business;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 pb-2 text-center">
      <div className="px-1 text-start">
        <DashboardSettingsBackLink />
      </div>
      <div data-tour-id="tour-order-hours">
        <DashboardOrderScheduleSettings
          initialEnabled={b.orderScheduleEnabled ?? false}
          initialScheduleJson={b.orderSchedule ?? null}
        />
      </div>
    </div>
  );
}
