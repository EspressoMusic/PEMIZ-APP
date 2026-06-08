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

export type BusinessTrialStatus = {
  trialEndsAt: Date;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  expired: boolean;
  hasSubscription: boolean;
};

export function getBusinessTrialStatus(
  business: BusinessTrialFields,
  now = Date.now()
): BusinessTrialStatus {
  const trialEndsAt = businessTrialEndsAt(business.createdAt);

  if (business.subscriptionActiveAt) {
    return {
      trialEndsAt,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      expired: false,
      hasSubscription: true,
    };
  }

  const msRemaining = trialEndsAt.getTime() - now;
  if (msRemaining <= 0) {
    return {
      trialEndsAt,
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      expired: true,
      hasSubscription: false,
    };
  }

  const totalMinutes = Math.floor(msRemaining / (1000 * 60));
  const daysRemaining = Math.floor(totalMinutes / (60 * 24));
  const hoursRemaining = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutesRemaining = totalMinutes % 60;

  return {
    trialEndsAt,
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
    expired: false,
    hasSubscription: false,
  };
}
