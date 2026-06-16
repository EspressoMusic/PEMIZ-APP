import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardAppointmentsCalendarSettings } from "@/components/dashboard/dashboard-appointments-calendar-settings";

export default async function SettingsSlotsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "APPOINTMENTS") redirect("/dashboard/settings");

  const b = user.business;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 pb-2 text-center">
      <div className="px-1 text-start">
        <DashboardActionsBackLink />
      </div>
      <DashboardAppointmentsCalendarSettings
        workingDays={{
          initialEnabled: b.orderScheduleEnabled ?? false,
          initialScheduleJson: b.orderSchedule ?? null,
        }}
      />
    </div>
  );
}
