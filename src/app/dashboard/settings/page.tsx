import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardStoreSettingsHub } from "@/components/dashboard/dashboard-store-settings-hub";
import { DashboardAppointmentsSettingsHub } from "@/components/dashboard/dashboard-appointments-settings-hub";
import { DashboardSettingsView } from "@/components/dashboard-settings";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const b = user.business;
  if (!b) redirect("/login");

  if (b.type === "APPOINTMENTS") {
    return <DashboardAppointmentsSettingsHub />;
  }

  if (b.type !== "STORE") {
    return (
      <DashboardSettingsView
        ownerName={user.name}
        email={user.email}
        phone={user.phone}
        businessName={b.name}
        isActive={b.isActive ?? false}
      />
    );
  }

  return <DashboardStoreSettingsHub />;
}
