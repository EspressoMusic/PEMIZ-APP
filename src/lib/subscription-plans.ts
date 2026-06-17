import type { AppLocale } from "@/lib/app-locale";

export type SubscriptionPlanId = "premium" | "ultimate";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  price: Record<AppLocale, number>;
  monthlyOrderLimit: number;
  featureKeys: readonly [string, string, string];
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "premium",
    price: { he: 49, en: 49 },
    monthlyOrderLimit: 500,
    featureKeys: [
      "subscriptionPremiumFeature1",
      "subscriptionPremiumFeature2",
      "subscriptionPremiumFeature3",
    ],
  },
  {
    id: "ultimate",
    price: { he: 89, en: 89 },
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

export function formatPlanPrice(amount: number, locale: AppLocale): string {
  const value = Math.round(amount);
  return locale === "he" ? `₪${value}` : `$${value}`;
}

export function planPrice(plan: SubscriptionPlan, locale: AppLocale): number {
  return plan.price[locale];
}

export function monthlyOrderLimitForPlan(
  planId: string | null | undefined
): number | null {
  const parsed = parseSubscriptionPlanId(planId);
  if (!parsed) return null;
  return getSubscriptionPlan(parsed).monthlyOrderLimit;
}
