import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProductsManager } from "@/components/dashboard/products-manager";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-settings-back-link";

export default async function SettingsProductsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") redirect("/dashboard/settings");

  return (
    <div className="space-y-4">
      <DashboardSettingsBackLink />
      <ProductsManager />
    </div>
  );
}
