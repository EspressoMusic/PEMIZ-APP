import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { studioConsolePath } from "@/lib/studio-access";
import { activateLegacyPendingBusiness } from "@/lib/business";
import { isBusinessTrialExpired } from "@/lib/business-trial";
import { syncBusinessTrialLock } from "@/lib/business-subscription";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ServiceUnavailableNotice } from "@/components/service-unavailable-notice";
import { recordSystemIncident } from "@/lib/system-incidents";
import { formatServerError } from "@/lib/server-errors";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    const detail = formatServerError(error);
    recordSystemIncident({
      context: "dashboard:layout",
      publicMessage: detail.publicMessage,
      developerMessage: detail.developerMessage,
      error,
    });
    return (
      <div className="dashboard-surface bakery-frame-bg h-dvh overflow-hidden">
        <ServiceUnavailableNotice />
      </div>
    );
  }
  if (!user) redirect("/login");
  if (!user.business) {
    if (user.role === "ADMIN") {
      const consolePath = studioConsolePath();
      redirect(consolePath || "/");
    }
    redirect("/onboarding");
  }

  const trialLock = await syncBusinessTrialLock(user.business);
  if (trialLock.locked || isBusinessTrialExpired(user.business)) {
    redirect("/trial-expired");
  }

  if (await activateLegacyPendingBusiness(user.business.id)) {
    redirect("/dashboard");
  }

  return (
    <div className="dashboard-surface bakery-frame-bg h-dvh overflow-hidden">
      <div className="app-safe-x mx-auto flex h-full min-h-0 w-full max-w-[1040px] flex-col overflow-hidden py-4 lg:px-[14px]">
        <DashboardShell
          businessId={user.business.id}
          businessType={user.business.type}
          storeLocale={user.business.storeLocale}
          storeTheme={user.business.storeTheme}
        >
          {children}
        </DashboardShell>
      </div>
    </div>
  );
}
