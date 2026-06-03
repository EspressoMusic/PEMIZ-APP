import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicBusinessUrl } from "@/lib/business";
import { Panel, SquareCard, Badge, Alert, PageTitle } from "@/components/ui";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  const b = user.business;
  const [orders, appointments, inquiries] = await Promise.all([
    prisma.order.count({ where: { businessId: b.id, status: "PENDING" } }),
    prisma.appointment.count({
      where: { businessId: b.id, status: "PENDING" },
    }),
    prisma.inquiry.count({ where: { businessId: b.id } }),
  ]);

  const link = publicBusinessUrl(b.slug);

  return (
    <div className="space-y-5">
      <PageTitle
        subtitle={b.type === "STORE" ? "חנות מוצרים" : "קביעת תורים"}
      >
        {b.name}
      </PageTitle>

      {!b.isActive && (
        <Alert variant="error">
          העסק מושבת על ידי מנהל המערכת. לקוחות רואים: &quot;This business is
          currently unavailable.&quot; פנה/י למנהל או הפעל/י מ־/master.
        </Alert>
      )}

      <Panel>
        <h2 className="text-[18px] font-bold text-bakery-ink">קישור ללקוחות</h2>
        <p
          className="mt-2 break-all font-mono text-[14px] text-bakery-primary"
          dir="ltr"
        >
          {link}
        </p>
        <Link
          href={`/b/${b.slug}`}
          className="mt-3 inline-block text-[14px] font-bold text-bakery-ink underline-offset-2 hover:underline"
        >
          תצוגה מקדימה →
        </Link>
      </Panel>

      <div className="grid gap-2.5 sm:grid-cols-3">
        {b.type === "STORE" && (
          <SquareCard className="p-4">
            <p className="text-[14px] text-bakery-muted">הזמנות ממתינות</p>
            <p className="text-[28px] font-extrabold text-bakery-ink">{orders}</p>
            <Link
              href="/dashboard/orders"
              className="text-[14px] font-bold text-bakery-primary"
            >
              ניהול הזמנות
            </Link>
          </SquareCard>
        )}
        {b.type === "APPOINTMENTS" && (
          <SquareCard className="p-4">
            <p className="text-[14px] text-bakery-muted">תורים ממתינים</p>
            <p className="text-[28px] font-extrabold text-bakery-ink">
              {appointments}
            </p>
            <Link
              href="/dashboard/appointments"
              className="text-[14px] font-bold text-bakery-primary"
            >
              ניהול תורים
            </Link>
          </SquareCard>
        )}
        <SquareCard className="p-4">
          <p className="text-[14px] text-bakery-muted">פניות</p>
          <p className="text-[28px] font-extrabold text-bakery-ink">{inquiries}</p>
          <Link
            href="/dashboard/inquiries"
            className="text-[14px] font-bold text-bakery-primary"
          >
            צפייה בפניות
          </Link>
        </SquareCard>
        <SquareCard className="p-4">
          <p className="text-[14px] text-bakery-muted">סטטוס</p>
          <div className="mt-2">
            <Badge tone={b.isActive ? "success" : "danger"}>
              {b.isActive ? "פעיל" : "מושבת"}
            </Badge>
          </div>
        </SquareCard>
      </div>
    </div>
  );
}
