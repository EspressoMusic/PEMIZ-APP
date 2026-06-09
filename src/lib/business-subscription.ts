import { prisma } from "@/lib/prisma";
import { type BusinessTrialFields } from "@/lib/business-trial";
import { isTrialEnforcedAndExpired } from "@/lib/trial-enforcement";

export type BusinessTrialState = BusinessTrialFields & {
  id: string;
  isActive: boolean;
};

export async function syncBusinessTrialLock(
  business: BusinessTrialState
): Promise<{ locked: boolean; isActive: boolean }> {
  if (!(await isTrialEnforcedAndExpired(business))) {
    return { locked: false, isActive: business.isActive };
  }

  if (!business.isActive) {
    return { locked: true, isActive: false };
  }

  await prisma.business.update({
    where: { id: business.id },
    data: { isActive: false },
  });

  return { locked: true, isActive: false };
}

export function trialExpiredErrorMessage(): string {
  return "נגמרה תקופת הניסיון";
}

export function isTrialExpiredApiError(message: string): boolean {
  return message.includes("נגמרה תקופת הניסיון");
}
