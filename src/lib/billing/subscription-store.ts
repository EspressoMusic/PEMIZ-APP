import { prisma } from "@/lib/prisma";
import {
  getSubscriptionPlan,
  type SubscriptionPlanId,
} from "@/lib/subscription-plans";
import type { BillingProviderId } from "@/lib/billing/types";

export async function findBusinessIdByExternalSubscriptionId(
  provider: BillingProviderId,
  externalSubscriptionId: string
): Promise<string | null> {
  const business = await prisma.business.findFirst({
    where: {
      subscriptionBillingProvider: provider,
      subscriptionExternalSubscriptionId: externalSubscriptionId,
    },
    select: { id: true },
  });
  if (business) return business.id;

  if (provider === "stripe") {
    const legacy = await prisma.business.findFirst({
      where: { subscriptionStripeSubscriptionId: externalSubscriptionId },
      select: { id: true },
    });
    return legacy?.id ?? null;
  }

  return null;
}

export async function activateBusinessSubscription(input: {
  businessId: string;
  planId: SubscriptionPlanId;
  provider: BillingProviderId;
  externalCustomerId: string;
  externalSubscriptionId: string;
  periodStart: Date;
  periodEnd: Date;
}) {
  getSubscriptionPlan(input.planId);

  const legacyStripe =
    input.provider === "stripe"
      ? {
          subscriptionStripeCustomerId: input.externalCustomerId,
          subscriptionStripeSubscriptionId: input.externalSubscriptionId,
        }
      : {
          subscriptionStripeCustomerId: null,
          subscriptionStripeSubscriptionId: null,
        };

  await prisma.business.update({
    where: { id: input.businessId },
    data: {
      subscriptionActiveAt: new Date(),
      subscriptionPlan: input.planId,
      isActive: true,
      subscriptionBillingProvider: input.provider,
      subscriptionExternalCustomerId: input.externalCustomerId,
      subscriptionExternalSubscriptionId: input.externalSubscriptionId,
      subscriptionCurrentPeriodStart: input.periodStart,
      subscriptionCurrentPeriodEnd: input.periodEnd,
      ...legacyStripe,
    },
  });
}

export async function syncBusinessSubscriptionPeriod(input: {
  businessId: string;
  planId?: SubscriptionPlanId | null;
  periodStart: Date;
  periodEnd: Date;
  active: boolean;
}) {
  const data: {
    subscriptionCurrentPeriodStart: Date;
    subscriptionCurrentPeriodEnd: Date;
    subscriptionActiveAt?: Date;
    subscriptionPlan?: SubscriptionPlanId | null;
    isActive?: boolean;
  } = {
    subscriptionCurrentPeriodStart: input.periodStart,
    subscriptionCurrentPeriodEnd: input.periodEnd,
  };

  if (input.active) {
    data.subscriptionActiveAt = new Date();
    data.isActive = true;
    if (input.planId === "premium" || input.planId === "ultimate") {
      data.subscriptionPlan = input.planId;
    }
  }

  await prisma.business.update({
    where: { id: input.businessId },
    data,
  });
}

export async function deactivateBusinessSubscription(businessId: string) {
  await prisma.business.update({
    where: { id: businessId },
    data: {
      subscriptionActiveAt: null,
      subscriptionPlan: null,
      subscriptionBillingProvider: null,
      subscriptionExternalCustomerId: null,
      subscriptionExternalSubscriptionId: null,
      subscriptionStripeCustomerId: null,
      subscriptionStripeSubscriptionId: null,
      subscriptionCurrentPeriodStart: null,
      subscriptionCurrentPeriodEnd: null,
      isActive: false,
    },
  });
}
