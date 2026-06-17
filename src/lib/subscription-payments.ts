/** When false (default), trial lock and Stripe checkout stay off. */
export function isSubscriptionPaymentsEnabled(): boolean {
  return process.env.SUBSCRIPTION_PAYMENTS_ENABLED === "true";
}
