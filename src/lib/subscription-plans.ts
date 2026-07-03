import type { AppLocale } from "@/lib/app-locale";

export type SubscriptionPlanId = "premium" | "ultimate";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  /** Monthly price in USD (English locale). */
  priceUsd: number;
  /** Monthly price in ILS (Hebrew locale). */
  priceIls: number;
  monthlyOrderLimit: number;
  featureKeys: readonly [string, string, string];
};

const PREMIUM_PLAN: SubscriptionPlan = {
  id: "premium",
  priceUsd: 49,
  priceIls: 149,
  monthlyOrderLimit: 500,
  featureKeys: [
    "subscriptionPremiumFeature1",
    "subscriptionPremiumFeature2",
    "subscriptionPremiumFeature3",
  ],
};

/** Legacy tier — kept for existing subscribers, not offered in the plan picker. */
const LEGACY_ULTIMATE_PLAN: SubscriptionPlan = {
  id: "ultimate",
  priceUsd: 89,
  priceIls: 325,
  monthlyOrderLimit: 1000,
  featureKeys: [
    "subscriptionUltimateFeature1",
    "subscriptionUltimateFeature2",
    "subscriptionUltimateFeature3",
  ],
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [PREMIUM_PLAN];

export function parseSubscriptionPlanId(
  value: string | null | undefined
): SubscriptionPlanId | null {
  if (value === "premium" || value === "ultimate") return value;
  return null;
}

export function getSubscriptionPlan(
  planId: SubscriptionPlanId
): SubscriptionPlan {
  if (planId === "ultimate") return LEGACY_ULTIMATE_PLAN;
  return PREMIUM_PLAN;
}

export function formatPlanPrice(amount: number, locale: AppLocale): string {
  const value = Math.round(amount);
  return locale === "he" ? `₪${value}` : `$${value}`;
}

export function planPrice(plan: SubscriptionPlan, locale: AppLocale): number {
  return locale === "he" ? plan.priceIls : plan.priceUsd;
}

export function monthlyOrderLimitForPlan(
  planId: string | null | undefined
): number | null {
  const parsed = parseSubscriptionPlanId(planId);
  if (!parsed) return null;
  return getSubscriptionPlan(parsed).monthlyOrderLimit;
}
