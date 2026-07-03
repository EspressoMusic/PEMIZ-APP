import type { MarketingLocale } from "@/lib/marketing-locale";
import {
  getSubscriptionPlan,
  planPrice,
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
      <strong>{Math.round(amount)}</strong>
      <span className="period">{period}</span>
    </div>
  );
}

export function MarketingLocaleFixedPrice({
  amountHe,
  amountEn,
  locale,
  period,
}: {
  amountHe: number;
  amountEn: number;
  locale: MarketingLocale;
  period: string;
}) {
  const amount = locale === "he" ? amountHe : amountEn;
  const symbol = locale === "he" ? "₪" : "$";
  return (
    <div className="price-amount" dir="ltr">
      <span className="currency">{symbol}</span>
      <strong>{amount}</strong>
      <span className="period">{period}</span>
    </div>
  );
}
