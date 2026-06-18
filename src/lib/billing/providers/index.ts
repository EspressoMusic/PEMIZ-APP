import { getSubscriptionBillingProviderId } from "@/lib/subscription-payments";
import type { SubscriptionBillingProvider } from "@/lib/billing/types";
import { paddleBillingProvider } from "@/lib/billing/providers/paddle-provider";
import { stripeBillingProvider } from "@/lib/billing/providers/stripe-provider";

const providers = {
  paddle: paddleBillingProvider,
  stripe: stripeBillingProvider,
} satisfies Record<
  ReturnType<typeof getSubscriptionBillingProviderId>,
  SubscriptionBillingProvider
>;

export function getConfiguredBillingProvider(): SubscriptionBillingProvider {
  return providers[getSubscriptionBillingProviderId()];
}
