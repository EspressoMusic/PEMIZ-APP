import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardStoreExtras } from "@/components/dashboard/dashboard-store-extras";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";

export default async function SettingsExtrasPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") redirect("/dashboard/settings");

  return (
    <div className="space-y-4">
      <DashboardSettingsBackLink />
      <DashboardStoreExtras
        initialDescription={user.business.description}
      />
    </div>
  );
}
