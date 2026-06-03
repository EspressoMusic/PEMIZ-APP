import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardSellerChatManager } from "@/components/dashboard/dashboard-seller-chat-manager";
import { DashboardCustomersBackLink } from "@/components/dashboard/dashboard-back-links";

export default async function DashboardCustomersChatPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  return (
    <div className="space-y-4">
      <DashboardCustomersBackLink />
      <DashboardSellerChatManager />
    </div>
  );
}
