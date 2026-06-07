import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppointmentsManager } from "@/components/dashboard-client";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";

export default async function SettingsAppointmentsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "APPOINTMENTS") redirect("/dashboard/settings");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <DashboardSettingsBackLink />
      <div className="min-h-0 flex-1 overflow-hidden">
        <AppointmentsManager />
      </div>
    </div>
  );
}
