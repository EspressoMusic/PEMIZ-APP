import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { publicBusinessUrl } from "@/lib/business";
import { Alert } from "@/components/ui";
import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";
import { getPrepSummaryForBusiness } from "@/lib/dashboard-prep-summary";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  const b = user.business;
  const prepProducts =
    b.type === "STORE" ? await getPrepSummaryForBusiness(b.id) : [];

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
        ownerName={user.name}
        businessSlug={b.slug}
        customerLink={publicBusinessUrl(b.slug)}
        previewHref={`/b/${b.slug}`}
        showPrepSummary={b.type === "STORE"}
        prepProducts={prepProducts}
      />
    </>
  );
}
