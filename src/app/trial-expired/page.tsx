import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { businessTrialEndsAt } from "@/lib/business-trial";
import { syncBusinessTrialLock } from "@/lib/business-subscription";
import { isTrialEnforcedAndExpired } from "@/lib/trial-enforcement";
import { parseLocaleCookie } from "@/lib/dashboard-appearance-boot";
import { AppLocaleProvider } from "@/components/dashboard/app-locale-provider";
import { DashboardTrialEndedScreen } from "@/components/dashboard/dashboard-trial-ended-screen";
import { WebShell } from "@/components/web-shell";
import { prisma } from "@/lib/prisma";
import { mapPendingOrdersFromRecords } from "@/lib/dashboard-prep-summary";
import { trialEndedPopupMessage } from "@/lib/trial-warnings";

export default async function TrialExpiredPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.business) redirect("/onboarding");

  await syncBusinessTrialLock(user.business);

  if (!(await isTrialEnforcedAndExpired(user.business))) {
    redirect("/dashboard");
  }

  const cookieStore = await cookies();
  const initialLocale = parseLocaleCookie(
    cookieStore.get("linky-dashboard-locale")?.value
  );

  const trialEndsAt = businessTrialEndsAt(user.business.createdAt).toISOString();
  const showRecentOrders = user.business.type === "STORE";
  const recentOrderRecords = showRecentOrders
    ? await prisma.order.findMany({
        where: { businessId: user.business.id },
        orderBy: { createdAt: "desc" },
        take: 15,
        include: { items: { include: { product: true } } },
      })
    : [];
  const recentOrders = mapPendingOrdersFromRecords(
    recentOrderRecords,
    initialLocale ?? "he"
  );

  return (
    <AppLocaleProvider initialLocale={initialLocale}>
      <WebShell lockViewport>
        <div className="mx-auto w-full max-w-lg px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
          <DashboardTrialEndedScreen
            trialEndsAt={trialEndsAt}
            businessName={user.business.name}
            recentOrders={recentOrders}
            showRecentOrders={showRecentOrders}
            modalMessage={trialEndedPopupMessage()}
          />
        </div>
      </WebShell>
    </AppLocaleProvider>
  );
}
