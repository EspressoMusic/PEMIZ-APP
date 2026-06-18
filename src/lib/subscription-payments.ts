import type { BillingProviderId } from "@/lib/billing/types";

/** When false (default), trial lock and paid checkout stay off. */
export function isSubscriptionPaymentsEnabled(): boolean {
  return process.env.SUBSCRIPTION_PAYMENTS_ENABLED === "true";
}

/** Default is Paddle (Israel-friendly). Set SUBSCRIPTION_BILLING_PROVIDER=stripe to switch. */
export function getSubscriptionBillingProviderId(): BillingProviderId {
  const raw = process.env.SUBSCRIPTION_BILLING_PROVIDER?.trim().toLowerCase();
  if (raw === "stripe") return "stripe";
  return "paddle";
}
