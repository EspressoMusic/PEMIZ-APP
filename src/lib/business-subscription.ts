import { prisma } from "@/lib/prisma";
import {
  isBusinessSubscriptionLocked,
  isBusinessTrialExpired,
  type BusinessTrialFields,
} from "@/lib/business-trial";

export type BusinessTrialState = BusinessTrialFields & {
  id: string;
  isActive: boolean;
};

export async function syncBusinessTrialLock(
  business: BusinessTrialState
): Promise<{ locked: boolean; isActive: boolean }> {
  if (!isBusinessTrialExpired(business)) {
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
