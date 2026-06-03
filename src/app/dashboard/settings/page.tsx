import { getCurrentUser } from "@/lib/auth";
import { publicBusinessUrl } from "@/lib/business";
import { Panel, PageTitle } from "@/components/ui";
import { LogoutButton } from "@/components/dashboard-client";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const b = user?.business;

  return (
    <div className="space-y-5">
      <PageTitle>הגדרות</PageTitle>
      <Panel>
        <p className="text-[14px] text-bakery-muted">חשבון</p>
        <p className="text-[17px] font-extrabold">{user?.name}</p>
        <p dir="ltr" className="text-[14px] text-bakery-muted">
          {user?.email}
        </p>
        <p className="text-[14px]">
          סטטוס חנות:{" "}
          {b?.isActive
            ? "✓ פעילה (אושרה)"
            : b?.approvedAt
              ? "מושבתת"
              : "ממתינה לאישור מנהל"}
        </p>
      </Panel>
      {b && (
        <Panel>
          <p className="text-[14px] text-bakery-muted">קישור עסק</p>
          <p
            className="break-all font-mono text-[14px] text-bakery-primary"
            dir="ltr"
          >
            {publicBusinessUrl(b.slug)}
          </p>
        </Panel>
      )}
      <LogoutButton />
    </div>
  );
}
