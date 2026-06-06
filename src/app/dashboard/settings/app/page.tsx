import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardInstallAppPage } from "@/components/dashboard/dashboard-install-app-page";

export default async function SettingsAppPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <DashboardInstallAppPage />;
}
