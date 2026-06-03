import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardStoreBroadcast } from "@/components/dashboard/dashboard-store-broadcast";
import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";

export default async function DashboardCustomersBroadcastPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  return (
    <div className="space-y-4">
      <DashboardCustomersBackLink />
      <DashboardStoreBroadcast />
    </div>
  );
}
