import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProductsManager } from "@/components/dashboard/products-manager";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";

export default async function SettingsProductsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") redirect("/dashboard/settings");

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <DashboardSettingsBackLink />
      <div className="min-h-0 flex-1 overflow-hidden">
        <ProductsManager />
      </div>
    </div>
  );
}
