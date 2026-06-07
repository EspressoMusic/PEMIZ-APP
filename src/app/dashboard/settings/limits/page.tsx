import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-back-links";
import { DashboardAppointmentBookingByDaySettings } from "@/components/dashboard/dashboard-appointment-booking-by-day-settings";
import { DashboardAppointmentCancelSettings } from "@/components/dashboard/dashboard-appointment-cancel-settings";
import { DashboardOrderScheduleSettings } from "@/components/dashboard/dashboard-order-schedule-settings";

export default async function SettingsLimitsPage() {
  const user = await getCurrentUser();
  if (!user?.business) redirect("/login");
  if (
    user.business.type !== "STORE" &&
    user.business.type !== "APPOINTMENTS"
  ) {
    redirect("/dashboard/settings");
  }

  const b = user.business;
  const isAppointments = b.type === "APPOINTMENTS";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 pb-2 text-center">
      <div className="px-1 text-start">
        <DashboardSettingsBackLink />
      </div>
      {isAppointments ? (
        <>
          <DashboardAppointmentCancelSettings
            initialStoreTerms={b.storeTerms ?? null}
          />
          <DashboardOrderScheduleSettings
            mode="appointments"
            initialEnabled={b.orderScheduleEnabled ?? false}
            initialScheduleJson={b.orderSchedule ?? null}
          />
          <DashboardAppointmentBookingByDaySettings
            initialBookingByDay={b.appointmentBookingByDay ?? false}
          />
        </>
      ) : (
        <DashboardOrderScheduleSettings
          initialEnabled={b.orderScheduleEnabled ?? false}
          initialScheduleJson={b.orderSchedule ?? null}
        />
      )}
    </div>
  );
}
