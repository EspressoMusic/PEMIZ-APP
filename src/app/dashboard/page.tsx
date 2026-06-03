import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { publicBusinessUrl } from "@/lib/business";
import { Alert } from "@/components/ui";
import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";
import { getPrepSummaryForBusiness } from "@/lib/dashboard-prep-summary";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  const b = user.business;
  const [orders, appointments, inquiries, prepProducts] = await Promise.all([
    prisma.order.count({ where: { businessId: b.id, status: "PENDING" } }),
    prisma.appointment.count({
      where: { businessId: b.id, status: "PENDING" },
    }),
    prisma.inquiry.count({ where: { businessId: b.id } }),
    b.type === "STORE"
      ? getPrepSummaryForBusiness(b.id)
      : Promise.resolve([]),
  ]);

  return (
    <>
      {!b.isActive && (
        <div className="mb-4 text-center">
        <Alert variant="error">
          העסק מושבת על ידי מנהל המערכת. לקוחות רואים: &quot;This business is
          currently unavailable.&quot; פנה/י למנהל או הפעל/י מ־/master.
        </Alert>
        </div>
      )}
      <DashboardHomeView
        businessName={b.name}
        customerLink={publicBusinessUrl(b.slug)}
        previewHref={`/b/${b.slug}`}
        pendingOrders={orders}
        pendingAppointments={appointments}
        inquiries={inquiries}
        isActive={b.isActive}
        showOrders={b.type === "STORE"}
        showAppointments={b.type === "APPOINTMENTS"}
        showPrepSummary={b.type === "STORE"}
        prepProducts={prepProducts}
      />
    </>
  );
}
