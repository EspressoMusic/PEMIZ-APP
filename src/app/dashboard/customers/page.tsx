import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardCustomersHub } from "@/components/dashboard/dashboard-customers-hub";

export default async function DashboardCustomersPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  return <DashboardCustomersHub />;
}
