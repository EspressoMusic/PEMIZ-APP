import { prisma } from "@/lib/prisma";
import {
  isBusinessTrialExpired,
  type BusinessTrialFields,
} from "@/lib/business-trial";
import {
  getSubscriptionPlan,
  monthlyOrderLimitForPlan,
  parseSubscriptionPlanId,
} from "@/lib/subscription-plans";
import { isSubscriptionPaymentsEnabled } from "@/lib/subscription-payments";

export type BusinessSubscriptionFields = BusinessTrialFields & {
  id: string;
  isActive: boolean;
  subscriptionPlan: string | null;
  subscriptionCurrentPeriodStart: Date | null;
  subscriptionCurrentPeriodEnd: Date | null;
};

export function billingPeriodForBusiness(
  business: Pick<
    BusinessSubscriptionFields,
    "subscriptionCurrentPeriodStart" | "subscriptionCurrentPeriodEnd"
  >,
  now = new Date()
): { start: Date; end: Date } {
  if (
    business.subscriptionCurrentPeriodStart &&
    business.subscriptionCurrentPeriodEnd
  ) {
    return {
      start: business.subscriptionCurrentPeriodStart,
      end: business.subscriptionCurrentPeriodEnd,
    };
  }

  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)
  );
  return { start, end };
}

export async function countMonthlyUsage(
  businessId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  const [orders, appointments] = await Promise.all([
    prisma.order.count({
      where: {
        businessId,
        createdAt: { gte: periodStart, lt: periodEnd },
      },
    }),
    prisma.appointment.count({
      where: {
        businessId,
        status: { not: "CANCELLED" },
        createdAt: { gte: periodStart, lt: periodEnd },
      },
    }),
  ]);
  return orders + appointments;
}

export type SubscriptionUsageStatus = {
  hasSubscription: boolean;
  limit: number | null;
  used: number;
  remaining: number | null;
  periodStart: Date;
  periodEnd: Date;
};

export async function getSubscriptionUsageStatus(
  business: BusinessSubscriptionFields
): Promise<SubscriptionUsageStatus> {
  const period = billingPeriodForBusiness(business);
  const used = await countMonthlyUsage(business.id, period.start, period.end);

  if (!business.subscriptionActiveAt) {
    return {
      hasSubscription: false,
      limit: null,
      used,
      remaining: null,
      periodStart: period.start,
      periodEnd: period.end,
    };
  }

  const limit = monthlyOrderLimitForPlan(business.subscriptionPlan);
  if (limit === null) {
    return {
      hasSubscription: true,
      limit: null,
      used,
      remaining: null,
      periodStart: period.start,
      periodEnd: period.end,
    };
  }

  return {
    hasSubscription: true,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    periodStart: period.start,
    periodEnd: period.end,
  };
}

export const SUBSCRIPTION_ORDER_LIMIT_MESSAGE_EN =
  "This store has reached its monthly order limit. Please try again later or contact the seller.";
export const SUBSCRIPTION_ORDER_LIMIT_MESSAGE_HE =
  "החנות הגיעה למכסת ההזמנות החודשית. נסו שוב מאוחר יותר או פנו למוכר.";

export async function assertCanAcceptCustomerBooking(
  business: BusinessSubscriptionFields,
  locale: "he" | "en" = "en"
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!business.isActive) {
    return {
      ok: false,
      message: "This business is currently unavailable.",
    };
  }

  if (
    isSubscriptionPaymentsEnabled() &&
    !business.subscriptionActiveAt &&
    isBusinessTrialExpired(business)
  ) {
    return {
      ok: false,
      message: "This business is currently unavailable.",
    };
  }

  if (!isSubscriptionPaymentsEnabled() || !business.subscriptionActiveAt) {
    return { ok: true };
  }

  const planId = parseSubscriptionPlanId(business.subscriptionPlan);
  if (!planId) {
    return { ok: true };
  }

  const limit = getSubscriptionPlan(planId).monthlyOrderLimit;
  const period = billingPeriodForBusiness(business);
  const used = await countMonthlyUsage(business.id, period.start, period.end);
  if (used >= limit) {
    return {
      ok: false,
      message:
        locale === "he"
          ? SUBSCRIPTION_ORDER_LIMIT_MESSAGE_HE
          : SUBSCRIPTION_ORDER_LIMIT_MESSAGE_EN,
    };
  }

  return { ok: true };
}
