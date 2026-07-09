import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { publicBusinessUrl } from "@/lib/business";
import { Alert } from "@/components/ui";
import { DashboardHubShell } from "@/components/dashboard/dashboard-hub-shell";
import { DashboardHomeView } from "@/components/dashboard/dashboard-home-view";
import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";
import {
  buildPrepSummaryFromOrders,
  getPendingOrdersForBusiness,
  type PendingOrderRecord,
} from "@/lib/dashboard-prep-summary";
import { withDbTimeout } from "@/lib/db-query-timeout";
import { calendarConfigFromBusiness } from "@/lib/appointment-calendar-config";
import { isScheduleLikeBusinessType, parseBusinessType } from "@/lib/types";

export default async function DashboardHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  const business = user.business;
  const scheduleLike = isScheduleLikeBusinessType(business.type);
  let pendingOrders: PendingOrderRecord[] = [];
  if (business.type === "STORE") {
    try {
      pendingOrders = await withDbTimeout(
        getPendingOrdersForBusiness(business.id)
      );
    } catch {
      pendingOrders = [];
    }
  }
  const prepProducts = buildPrepSummaryFromOrders(pendingOrders);

  return (
    <DashboardHubShell
      home={
        <>
          {!business.isActive ? (
            <div className="mb-4 shrink-0 text-center">
              <Alert variant="error">
                This business was disabled by the platform admin. Customers
                see: &quot;This business is currently unavailable.&quot; Contact
                the platform administrator.
              </Alert>
            </div>
          ) : null}
          <DashboardHomeView
            ownerName={user.name}
            businessSlug={business.slug}
            businessType={parseBusinessType(business.type)}
            customerLink={publicBusinessUrl(business.slug)}
            previewHref={`/b/${business.slug}`}
            showPrepSummary={business.type === "STORE"}
            prepProducts={prepProducts}
            initialPendingOrders={pendingOrders}
          />
        </>
      }
      actions={
        <DashboardActionsHub
          businessType={business.type}
          initialStoreTerms={
            scheduleLike ? business.storeTerms ?? null : null
          }
          initialCalendarConfig={
            scheduleLike ? calendarConfigFromBusiness(business) : undefined
          }
          initialWorkingDays={
            scheduleLike
              ? {
                  initialEnabled: business.orderScheduleEnabled ?? false,
                  initialScheduleJson: business.orderSchedule ?? null,
                }
              : undefined
          }
        />
      }
    >
      {children}
    </DashboardHubShell>
  );
}
