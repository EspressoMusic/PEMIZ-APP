import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardDealsAndLimitsHub } from "@/components/dashboard/dashboard-deals-and-limits-hub";
import { storePanelsFromBusiness } from "@/lib/store-panels-visible";

export default async function SettingsDealsAndLimitsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") redirect("/dashboard/settings");

  const b = user.business;

  return (
    <DashboardDealsAndLimitsHub
      initialOrderScheduleEnabled={b.orderScheduleEnabled ?? false}
      initialOrderScheduleJson={b.orderSchedule ?? null}
      panels={storePanelsFromBusiness(b)}
    />
  );
}
