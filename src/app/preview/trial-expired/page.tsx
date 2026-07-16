import type { Metadata } from "next";
import { AppLocaleProvider } from "@/components/dashboard/app-locale-provider";
import { DashboardTrialPaywall } from "@/components/dashboard/dashboard-trial-paywall";
import { WebShell } from "@/components/web-shell";

export const metadata: Metadata = {
  title: "Trial expired preview — Peymiz",
  robots: { index: false, follow: false },
};

export default function PreviewTrialExpiredPage() {
  const trialEndsAt = new Date(
    Date.now() - 2 * 24 * 60 * 60 * 1000
  ).toISOString();

  return (
    <AppLocaleProvider initialLocale="he">
      <WebShell lockViewport>
        <div className="mx-auto w-full max-w-lg px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
          <DashboardTrialPaywall trialEndsAt={trialEndsAt} />
        </div>
      </WebShell>
    </AppLocaleProvider>
  );
}
