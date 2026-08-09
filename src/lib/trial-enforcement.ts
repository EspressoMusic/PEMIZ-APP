import { getPlatformConfig } from "@/lib/platform-config";
import {
  isBusinessTrialExpired,
  type BusinessTrialFields,
} from "@/lib/business-trial";
import { isBusinessTrialBypassed } from "@/lib/trial-dev";

/**
 * Trial closure no longer requires a configured payment provider — there is
 * no self-serve checkout yet (Paddle is intentionally disabled), so sellers
 * pay manually (bank transfer etc.) after contacting support via WhatsApp.
 * The master panel "סגירה אוטומטית" toggle remains the only kill switch.
 */
export async function isTrialClosureEnabled(): Promise<boolean> {
  const config = await getPlatformConfig();
  return config.trialClosureEnabled !== false;
}

export async function areTrialWarningEmailsEnabled(): Promise<boolean> {
  const config = await getPlatformConfig();
  return config.trialWarningEmailsEnabled !== false;
}

export async function isTrialEnforcedAndExpired(
  business: BusinessTrialFields
): Promise<boolean> {
  if (isBusinessTrialBypassed()) return false;
  if (!(await isTrialClosureEnabled())) return false;
  return isBusinessTrialExpired(business);
}
