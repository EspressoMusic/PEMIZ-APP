import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardReviewsManager } from "@/components/dashboard/dashboard-reviews-manager";
import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";

export default async function DashboardCustomersReviewsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  return (
    <div className="space-y-4">
      <DashboardCustomersBackLink />
      <DashboardReviewsManager />
    </div>
  );
}
