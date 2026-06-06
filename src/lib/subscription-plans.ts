import type { AppLocale } from "@/lib/app-locale";

export type SubscriptionPlanId = "premium" | "ultimate";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  price: Record<AppLocale, number>;
  featureKeys: readonly [string, string, string];
};

/** Same list price; Hebrew store shows ₪, English shows $. */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "premium",
    price: { he: 49, en: 49 },
    featureKeys: [
      "subscriptionPremiumFeature1",
      "subscriptionPremiumFeature2",
      "subscriptionPremiumFeature3",
    ],
  },
  {
    id: "ultimate",
    price: { he: 99, en: 99 },
    featureKeys: [
      "subscriptionUltimateFeature1",
      "subscriptionUltimateFeature2",
      "subscriptionUltimateFeature3",
    ],
  },
];

export function formatPlanPrice(amount: number, locale: AppLocale): string {
  const value = Math.round(amount);
  return locale === "he" ? `₪${value}` : `$${value}`;
}

export function planPrice(plan: SubscriptionPlan, locale: AppLocale): number {
  return plan.price[locale];
}
