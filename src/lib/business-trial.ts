export const BUSINESS_TRIAL_DAYS = 30;

export type BusinessTrialFields = {
  createdAt: Date;
  subscriptionActiveAt: Date | null;
};

export function businessTrialEndsAt(createdAt: Date): Date {
  return new Date(
    createdAt.getTime() + BUSINESS_TRIAL_DAYS * 24 * 60 * 60 * 1000
  );
}

export function isBusinessTrialExpired(business: BusinessTrialFields): boolean {
  if (business.subscriptionActiveAt) return false;
  return Date.now() >= businessTrialEndsAt(business.createdAt).getTime();
}

export function isBusinessSubscriptionLocked(
  business: BusinessTrialFields & { isActive: boolean }
): boolean {
  return isBusinessTrialExpired(business);
}
