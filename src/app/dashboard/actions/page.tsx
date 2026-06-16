import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardActionsHub } from "@/components/dashboard/dashboard-actions-hub";
import { calendarConfigFromBusiness } from "@/lib/appointment-calendar-config";
import { isScheduleLikeBusinessType } from "@/lib/types";

export default async function DashboardActionsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/onboarding");

  const business = user.business;
  const scheduleLike = isScheduleLikeBusinessType(business.type);

  return (
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
  );
}
