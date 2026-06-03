import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardStoreSettingsHub } from "@/components/dashboard/dashboard-store-settings-hub";
import { DashboardSettingsView } from "@/components/dashboard-settings";
import { publicBusinessUrl } from "@/lib/business";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const b = user.business;
  if (!b || b.type !== "STORE") {
    return (
      <DashboardSettingsView
        ownerName={user.name}
        email={user.email}
        businessName={b?.name}
        isActive={b?.isActive ?? false}
        storeUrl={b ? publicBusinessUrl(b.slug) : undefined}
        previewSlug={b?.slug}
      />
    );
  }

  return <DashboardStoreSettingsHub />;
}
