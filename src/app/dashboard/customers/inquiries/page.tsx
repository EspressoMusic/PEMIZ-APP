import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardInquiriesManager } from "@/components/dashboard/dashboard-inquiries-manager";
import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";

export default async function DashboardCustomersInquiriesPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  return (
    <div className="space-y-4">
      <DashboardCustomersBackLink />
      <div data-tour-id="tour-inquiries">
        <DashboardInquiriesManager />
      </div>
    </div>
  );
}
