import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardAppointmentsCalendarSettings } from "@/components/dashboard/dashboard-appointments-calendar-settings";

export default async function SettingsSlotsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "APPOINTMENTS") redirect("/dashboard/settings");

  return (
    <div className="flex flex-col gap-3 pb-2">
      <DashboardSettingsBackLink />
      <DashboardAppointmentsCalendarSettings />
    </div>
  );
}
