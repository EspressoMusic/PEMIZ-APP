import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardWhatsAppPage } from "@/components/dashboard/dashboard-whatsapp-page";
import { isWhatsAppConfigured } from "@/lib/whatsapp";

export default async function SettingsWhatsAppPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (user.business.type !== "STORE") redirect("/dashboard/settings");

  const b = user.business;

  return (
    <DashboardWhatsAppPage
      initialEnabled={b.whatsappNotifyEnabled ?? false}
      initialPhone={b.whatsappNotifyPhone ?? ""}
      ownerPhone={user.phone ?? ""}
      serverConfigured={isWhatsAppConfigured()}
    />
  );
}
