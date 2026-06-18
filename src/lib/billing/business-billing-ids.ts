type BusinessBillingIds = {
  subscriptionActiveAt?: Date | null;
  subscriptionExternalCustomerId?: string | null;
  subscriptionStripeCustomerId?: string | null;
  subscriptionExternalSubscriptionId?: string | null;
  subscriptionStripeSubscriptionId?: string | null;
};

export function externalCustomerIdForBusiness(
  business: BusinessBillingIds
): string | null {
  return (
    business.subscriptionExternalCustomerId?.trim() ||
    business.subscriptionStripeCustomerId?.trim() ||
    null
  );
}

export function externalSubscriptionIdForBusiness(
  business: BusinessBillingIds
): string | null {
  return (
    business.subscriptionExternalSubscriptionId?.trim() ||
    business.subscriptionStripeSubscriptionId?.trim() ||
    null
  );
}

export function canOpenBillingPortal(business: BusinessBillingIds): boolean {
  return Boolean(
    business.subscriptionActiveAt && externalCustomerIdForBusiness(business)
  );
}
