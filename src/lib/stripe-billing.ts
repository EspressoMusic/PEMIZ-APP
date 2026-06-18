/** @deprecated Import from @/lib/billing/* instead. Kept for older imports. */
export {
  getStripe,
  stripePriceIdForPlan,
  subscriptionBillingPeriod,
} from "@/lib/billing/providers/stripe-provider";
export { appBaseUrl } from "@/lib/billing/app-base-url";
export {
  activateBusinessSubscription,
  deactivateBusinessSubscription,
  syncBusinessSubscriptionPeriod,
} from "@/lib/billing/subscription-store";
