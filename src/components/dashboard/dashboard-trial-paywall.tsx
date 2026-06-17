"use client";

import { useState } from "react";
import { Alert, Panel, PageTitle } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  formatPlanPrice,
  planPrice,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from "@/lib/subscription-plans";
import type { DashboardLabels } from "@/lib/app-locale";
import { useSubscriptionCheckout } from "@/components/dashboard/use-subscription-checkout";

function featureLabel(labels: DashboardLabels, key: string): string {
  switch (key) {
    case "subscriptionPremiumFeature1":
      return labels.subscriptionPremiumFeature1;
    case "subscriptionPremiumFeature2":
      return labels.subscriptionPremiumFeature2;
    case "subscriptionPremiumFeature3":
      return labels.subscriptionPremiumFeature3;
    case "subscriptionUltimateFeature1":
      return labels.subscriptionUltimateFeature1;
    case "subscriptionUltimateFeature2":
      return labels.subscriptionUltimateFeature2;
    case "subscriptionUltimateFeature3":
      return labels.subscriptionUltimateFeature3;
    default:
      return "";
  }
}

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

      <p className="mb-4 text-center text-[14px] font-semibold leading-relaxed text-bakery-muted">
        {labels.subscriptionPlansHint}
      </p>

      <div className="space-y-3">
        {SUBSCRIPTION_PLANS.map((plan) => {
          const title =
            plan.id === "premium"
              ? labels.subscriptionPremium
              : labels.subscriptionUltimate;
          const price = formatPlanPrice(planPrice(plan, locale), locale);
          const loading = payingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className="rounded-[22px] border border-bakery-border/40 bg-[#F2EBE0] px-4 py-4 text-center"
            >
              <p className="text-[18px] font-extrabold text-bakery-ink">{title}</p>
              <p className="mt-1 flex items-baseline justify-center gap-1">
                <span
                  className="text-[28px] font-extrabold tabular-nums text-bakery-primary"
                  dir="ltr"
                >
                  {price}
                </span>
                <span className="text-[13px] font-bold text-bakery-muted">
                  {labels.subscriptionPerMonth}
                </span>
              </p>
              <ul className="mt-3 space-y-1.5 text-[13px] font-semibold leading-snug text-bakery-ink">
                {plan.featureKeys.map((key) => (
                  <li key={key}>{featureLabel(labels, key)}</li>
                ))}
              </ul>
              <button
                type="button"
                disabled={loading}
                className="bakery-cta-3d bakery-cta-3d--primary mt-4 w-full !rounded-full !py-3 text-[15px] font-extrabold disabled:opacity-60"
                onClick={() => void payMonthly(plan.id)}
              >
                {loading ? labels.saving : labels.subscriptionPayMonthly}
              </button>
            </div>
          );
        })}
      </div>

      {message ? (
        <p className="mt-4 text-center text-[13px] font-semibold text-bakery-muted">
          {message}
        </p>
      ) : null}
    </Panel>
  );
}
