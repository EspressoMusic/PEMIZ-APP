"use client";

import type { AppLocale, DashboardLabels } from "@/lib/app-locale";
import {
  formatPlanPrice,
  planPrice,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from "@/lib/subscription-plans";

function featureLabel(labels: DashboardLabels, key: string): string {
  const value = (labels as unknown as Record<string, string>)[key];
  return typeof value === "string" ? value : "";
}

export function DashboardSubscriptionPlanPicker({
  locale,
  labels,
  payingPlan,
  previewOnly = false,
  activationUnavailable = false,
  chooseLabel,
  onChoosePlan,
  onActivationUnavailable,
}: {
  locale: AppLocale;
  labels: DashboardLabels;
  payingPlan: SubscriptionPlanId | null;
  previewOnly?: boolean;
  /** Activation is temporarily turned off for real users; card renders faded and taps show a message instead of starting checkout. */
  activationUnavailable?: boolean;
  chooseLabel?: string;
  onChoosePlan: (planId: SubscriptionPlanId) => void;
  onActivationUnavailable?: () => void;
}) {
  const ctaLabel =
    chooseLabel ??
    (previewOnly ? labels.subscriptionPreviewOnly : labels.subscriptionSignUp);

  const planCardClass =
    "dashboard-subscription-panel flex min-h-[300px] flex-col overflow-hidden rounded-[22px] px-4 pb-4 pt-4 text-center";

  return (
    <div className="space-y-3">
      {SUBSCRIPTION_PLANS.map((plan) => {
        const price = formatPlanPrice(planPrice(plan, locale), locale);
        const loading = payingPlan === plan.id;

        return (
          <div
            key={plan.id}
            className={`${planCardClass} dashboard-subscription-premium-strip ${
              activationUnavailable ? "opacity-50 saturate-50" : ""
            }`}
          >
            <span className="text-[18px] font-extrabold tracking-wide text-bakery-primary">
              {labels.subscriptionPremium}
            </span>

            <p className="mt-3 flex items-baseline justify-center gap-1">
              <span
                className="text-[32px] font-extrabold tabular-nums text-bakery-primary"
                dir="ltr"
              >
                {price}
              </span>
              <span className="text-[15px] font-bold text-bakery-muted">
                {labels.subscriptionPerMonth}
              </span>
            </p>

            <ul className="mt-3 flex-1 space-y-2 text-[15px] font-semibold leading-snug text-bakery-ink">
              {plan.featureKeys.map((key) => (
                <li key={key}>{featureLabel(labels, key)}</li>
              ))}
            </ul>

            <button
              type="button"
              disabled={loading || previewOnly}
              aria-disabled={activationUnavailable}
              className={`bakery-cta-3d bakery-cta-3d--primary mt-4 w-full !rounded-full !py-3.5 text-[16px] font-extrabold disabled:opacity-60 ${
                activationUnavailable ? "cursor-not-allowed opacity-60" : ""
              }`}
              onClick={() => {
                if (activationUnavailable) {
                  onActivationUnavailable?.();
                  return;
                }
                onChoosePlan(plan.id);
              }}
            >
              {loading ? labels.saving : ctaLabel}
            </button>
          </div>
        );
      })}
    </div>
  );
}
