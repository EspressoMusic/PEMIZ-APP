import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { publicBusinessUrl } from "@/lib/business";
import { DashboardSettingsView } from "@/components/dashboard-settings";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const b = user.business;

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
