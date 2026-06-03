import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";

export default async function DashboardActionsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  return (
    <DashboardActionsHub
      businessType={user.business.type}
      storeTheme={user.business.storeTheme}
    />
  );
}
