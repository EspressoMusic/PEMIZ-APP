"use client";

import type { AppLocale, DashboardLabels } from "@/lib/app-locale";
import { marketingWhatsAppUrl } from "@/lib/marketing-contact";
import {
  formatPlanPrice,
  planPrice,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from "@/lib/subscription-plans";

function featureLabel(labels: DashboardLabels, key: string): string {
  switch (key) {
    case "subscriptionPremiumFeature1":
      return labels.subscriptionPremiumFeature1;
    case "subscriptionPremiumFeature2":
      return labels.subscriptionPremiumFeature2;
    case "subscriptionPremiumFeature3":
      return labels.subscriptionPremiumFeature3;
    default:
      return "";
  }
}

export function DashboardSubscriptionPlanPicker({
  locale,
  labels,
  payingPlan,
  previewOnly = false,
  chooseLabel,
  onChoosePlan,
}: {
  locale: AppLocale;
  labels: DashboardLabels;
  payingPlan: SubscriptionPlanId | null;
  previewOnly?: boolean;
  chooseLabel?: string;
  onChoosePlan: (planId: SubscriptionPlanId) => void;
}) {
  const contactHref = marketingWhatsAppUrl(locale);
  const ctaLabel =
    chooseLabel ??
    (previewOnly ? labels.subscriptionPreviewOnly : labels.subscriptionSignUp);

  return (
    <div className="space-y-3">
      {SUBSCRIPTION_PLANS.map((plan) => {
        const price = formatPlanPrice(planPrice(plan, locale), locale);
        const loading = payingPlan === plan.id;

        return (
          <div
            key={plan.id}
            className="dashboard-subscription-panel overflow-hidden rounded-[22px] border border-bakery-border/40 px-4 pb-4 pt-3 text-center"
          >
            <div className="dashboard-subscription-premium-strip mx-auto w-full max-w-[240px] px-4 py-2.5">
              <span className="text-[15px] font-extrabold tracking-wide text-bakery-primary">
                {labels.subscriptionPremium}
              </span>
            </div>

            <p className="mt-3 flex items-baseline justify-center gap-1">
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
              disabled={loading || previewOnly}
              className="bakery-cta-3d bakery-cta-3d--primary mt-4 w-full !rounded-full !py-3 text-[15px] font-extrabold disabled:opacity-60"
              onClick={() => onChoosePlan(plan.id)}
            >
              {loading ? labels.saving : ctaLabel}
            </button>
          </div>
        );
      })}

      <div className="dashboard-subscription-panel rounded-[22px] border border-bakery-border/40 px-4 py-4 text-center">
        <p className="text-[18px] font-extrabold text-bakery-ink">
          {labels.subscriptionEnterpriseTitle}
        </p>
        <p className="mt-2 text-[13px] font-semibold leading-snug text-bakery-muted">
          {labels.subscriptionEnterpriseHint}
        </p>
        {contactHref ? (
          <a
            href={contactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="bakery-cta-3d bakery-cta-3d--primary mt-4 inline-flex w-full items-center justify-center !rounded-full !py-3 text-[15px] font-extrabold no-underline"
          >
            {labels.subscriptionContactUs}
          </a>
        ) : null}
      </div>
    </div>
  );
}
