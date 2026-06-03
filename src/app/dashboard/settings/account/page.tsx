import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { publicBusinessUrl } from "@/lib/business";
import { DashboardSettingsView } from "@/components/dashboard-settings";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";

export default async function SettingsAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const b = user.business;

  return (
    <div className="space-y-4">
      {b?.type === "STORE" && <DashboardSettingsBackLink />}
      <DashboardSettingsView
        ownerName={user.name}
        email={user.email}
        businessName={b?.name}
        isActive={b?.isActive ?? false}
        storeUrl={b ? publicBusinessUrl(b.slug) : undefined}
        previewSlug={b?.slug}
      />
    </div>
  );
}
