import type { MarketingLocale } from "@/lib/marketing-locale";
import {
  getSubscriptionPlan,
  planPrice,
  usdPriceToLocaleAmount,
  type SubscriptionPlanId,
} from "@/lib/subscription-plans";

function planAmount(planId: SubscriptionPlanId, locale: MarketingLocale): number {
  return Math.round(planPrice(getSubscriptionPlan(planId), locale));
}

export function MarketingPlanPrice({
  planId,
  locale,
  period,
}: {
  planId: SubscriptionPlanId;
  locale: MarketingLocale;
  period: string;
}) {
  const symbol = locale === "he" ? "₪" : "$";
  return (
    <div className="price-amount" dir="ltr">
      <span className="currency">{symbol}</span>
      <strong>{planAmount(planId, locale)}</strong>
      <span className="period">{period}</span>
    </div>
  );
}

export function MarketingFixedPlanPrice({
  amount,
  locale,
  period,
}: {
  amount: number;
  locale: MarketingLocale;
  period: string;
}) {
  const symbol = locale === "he" ? "₪" : "$";
  return (
    <div className="price-amount" dir="ltr">
      <span className="currency">{symbol}</span>
      <strong>{Math.round(usdPriceToLocaleAmount(amount, locale))}</strong>
      <span className="period">{period}</span>
    </div>
  );
}
