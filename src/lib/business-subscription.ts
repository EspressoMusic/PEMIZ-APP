import { type BusinessTrialFields } from "@/lib/business-trial";
import { isTrialEnforcedAndExpired } from "@/lib/trial-enforcement";

export type BusinessTrialState = BusinessTrialFields & {
  id: string;
  isActive: boolean;
};

/**
 * `isActive` means "admin approved / not disabled" — trial expiry must never
 * write to it. Locking the dashboard and blocking new orders both key off
 * `locked` (and `assertCanAcceptCustomerBooking`'s own trial check) instead,
 * so an expired trial no longer also hides the storefront from browsing.
 */
export async function syncBusinessTrialLock(
  business: BusinessTrialState
): Promise<{ locked: boolean; isActive: boolean }> {
  const locked = await isTrialEnforcedAndExpired(business);
  return { locked, isActive: business.isActive };
}

export function trialExpiredErrorMessage(): string {
  return "נגמרה תקופת הניסיון";
}

export function isTrialExpiredApiError(message: string): boolean {
  return message.includes("נגמרה תקופת הניסיון");
}
