import type { SubscriptionPlanId } from "@/lib/subscription-plans";

/** Active subscription billing backend — switch via SUBSCRIPTION_BILLING_PROVIDER. */
export type BillingProviderId = "paddle" | "stripe";

export type SubscriptionCheckoutInput = {
  planId: SubscriptionPlanId;
  businessId: string;
  userId: string;
  customerEmail: string;
};

export type SubscriptionCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; status: number; message: string };

export interface SubscriptionBillingProvider {
  id: BillingProviderId;
  isConfigured(): boolean;
  createCheckoutSession(
    input: SubscriptionCheckoutInput
  ): Promise<SubscriptionCheckoutResult>;
}
