"use client";

import { Alert, Panel, PageTitle } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { useSubscriptionCheckout } from "@/components/dashboard/use-subscription-checkout";
import type { SubscriptionPlanId } from "@/lib/subscription-plans";
import { DashboardSubscriptionPlanPicker } from "@/components/dashboard/dashboard-subscription-plan-picker";
import { DashboardDeleteStoreSection } from "@/components/dashboard/dashboard-delete-store-section";

export function DashboardTrialPaywall({
  trialEndsAt,
  businessName,
  previewOnly = false,
}: {
  trialEndsAt: string;
  businessName?: string;
  previewOnly?: boolean;
}) {
  const { labels, locale } = useAppLocale();
  const { payingPlan, message, startCheckout } = useSubscriptionCheckout();

  async function payMonthly(planId: SubscriptionPlanId) {
    await startCheckout(planId, labels.subscriptionComingSoon);
  }

  return (
    <Panel>
      <PageTitle subtitle={labels.trialExpiredHint}>
        {labels.trialExpiredTitle}
      </PageTitle>

      <div className="mb-4">
        <Alert variant="error" className="text-center">
          {labels.trialExpiredTitle}
        </Alert>
      </div>

      <p className="mb-4 text-center text-[13px] font-semibold text-bakery-muted">
        {labels.trialExpiredEndedOn}{" "}
        <span dir="ltr" className="font-bold text-bakery-ink">
          {new Date(trialEndsAt).toLocaleDateString(
            locale === "he" ? "he-IL" : "en-GB"
          )}
        </span>
      </p>

      <DashboardSubscriptionPlanPicker
        locale={locale}
        labels={labels}
        payingPlan={payingPlan}
        chooseLabel={labels.subscriptionPayMonthly}
        onChoosePlan={(planId) => void payMonthly(planId)}
      />

      {message ? (
        <p className="mt-4 text-center text-[13px] font-semibold text-bakery-muted">
          {message}
        </p>
      ) : null}

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-bakery-border/60" />
        <span className="text-[12px] font-bold uppercase text-bakery-muted">
          {labels.trialExpiredOrDivider}
        </span>
        <span className="h-px flex-1 bg-bakery-border/60" />
      </div>

      <p className="mb-3 text-center text-[13px] font-semibold text-bakery-muted">
        {labels.trialExpiredCloseStoreHint}
      </p>
      <DashboardDeleteStoreSection
        businessName={businessName}
        previewOnly={previewOnly}
      />
    </Panel>
  );
}
