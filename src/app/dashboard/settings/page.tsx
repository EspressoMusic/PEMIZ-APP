import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";
import { DashboardSettingsView } from "@/components/dashboard-settings";
import { calendarConfigFromBusiness } from "@/lib/appointment-calendar-config";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const b = user.business;
  if (!b) redirect("/login");

  if (b.type === "APPOINTMENTS") {
    return (
      <DashboardActionsHub
        businessType={b.type}
        initialOpenPanel="store"
        initialStoreTerms={b.storeTerms ?? null}
        initialCalendarConfig={calendarConfigFromBusiness(b)}
        initialWorkingDays={{
          initialEnabled: b.orderScheduleEnabled ?? false,
          initialScheduleJson: b.orderSchedule ?? null,
        }}
      />
    );
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

  return <DashboardActionsHub businessType={b.type} initialOpenPanel="store" />;
}
