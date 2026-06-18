import type { AppLocale } from "@/lib/app-locale";

export type SubscriptionPlanId = "premium" | "ultimate";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  /** Monthly price in USD — converted to ILS for Hebrew locale. */
  priceUsd: number;
  monthlyOrderLimit: number;
  featureKeys: readonly [string, string, string];
};

/** Fixed display conversion for Hebrew pricing (USD list prices → ILS). */
export const USD_TO_ILS_RATE = 3.65;

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "premium",
    priceUsd: 49,
    monthlyOrderLimit: 500,
    featureKeys: [
      "subscriptionPremiumFeature1",
      "subscriptionPremiumFeature2",
      "subscriptionPremiumFeature3",
    ],
  },
  {
    id: "ultimate",
    priceUsd: 89,
    monthlyOrderLimit: 1000,
    featureKeys: [
      "subscriptionUltimateFeature1",
      "subscriptionUltimateFeature2",
      "subscriptionUltimateFeature3",
    ],
  },
];

export function parseSubscriptionPlanId(
  value: string | null | undefined
): SubscriptionPlanId | null {
  if (value === "premium" || value === "ultimate") return value;
  return null;
}

export function getSubscriptionPlan(
  planId: SubscriptionPlanId
): SubscriptionPlan {
  const plan = SUBSCRIPTION_PLANS.find((row) => row.id === planId);
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  return plan;
}

export function usdPriceToLocaleAmount(usd: number, locale: AppLocale): number {
  if (locale === "en") return usd;
  return Math.round(usd * USD_TO_ILS_RATE);
}

export function formatPlanPrice(amount: number, locale: AppLocale): string {
  const value = Math.round(amount);
  return locale === "he" ? `₪${value}` : `$${value}`;
}

export function planPrice(plan: SubscriptionPlan, locale: AppLocale): number {
  return usdPriceToLocaleAmount(plan.priceUsd, locale);
}

export function monthlyOrderLimitForPlan(
  planId: string | null | undefined
): number | null {
  const parsed = parseSubscriptionPlanId(planId);
  if (!parsed) return null;
  return getSubscriptionPlan(parsed).monthlyOrderLimit;
}
