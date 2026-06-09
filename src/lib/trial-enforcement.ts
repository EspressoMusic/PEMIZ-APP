import { getPlatformConfig } from "@/lib/platform-config";
import {
  isBusinessTrialExpired,
  type BusinessTrialFields,
} from "@/lib/business-trial";

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
  if (!(await isTrialClosureEnabled())) return false;
  return isBusinessTrialExpired(business);
}
