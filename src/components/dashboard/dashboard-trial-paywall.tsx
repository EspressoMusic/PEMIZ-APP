"use client";

import { useState } from "react";
import { Alert, Panel, PageTitle } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import type { DashboardLabels } from "@/lib/app-locale";
import { useSubscriptionCheckout } from "@/components/dashboard/use-subscription-checkout";
import type { SubscriptionPlanId } from "@/lib/subscription-plans";
import { DashboardSubscriptionPlanPicker } from "@/components/dashboard/dashboard-subscription-plan-picker";

export function DashboardTrialPaywall({
  trialEndsAt,
}: {
  trialEndsAt: string;
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
        <Alert variant="error">{labels.trialExpiredTitle}</Alert>
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
    </Panel>
  );
}
