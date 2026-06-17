import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  getSubscriptionPlan,
  type SubscriptionPlanId,
} from "@/lib/subscription-plans";

export function subscriptionBillingPeriod(subscription: Stripe.Subscription) {
  const raw = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
    currentPeriodStart?: number;
    currentPeriodEnd?: number;
  };
  const startSec =
    raw.current_period_start ?? raw.currentPeriodStart ?? Math.floor(Date.now() / 1000);
  const endSec =
    raw.current_period_end ??
    raw.currentPeriodEnd ??
    startSec + 30 * 24 * 60 * 60;
  return {
    periodStart: new Date(startSec * 1000),
    periodEnd: new Date(endSec * 1000),
  };
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key);
}

export function stripePriceIdForPlan(planId: SubscriptionPlanId): string | null {
  if (planId === "premium") {
    return process.env.STRIPE_PRICE_PREMIUM?.trim() || null;
  }
  if (planId === "ultimate") {
    return process.env.STRIPE_PRICE_ULTIMATE?.trim() || null;
  }
  return null;
}

export function appBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!url) return "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export async function activateBusinessSubscription(input: {
  businessId: string;
  planId: SubscriptionPlanId;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  periodStart: Date;
  periodEnd: Date;
}) {
  getSubscriptionPlan(input.planId);
  await prisma.business.update({
    where: { id: input.businessId },
    data: {
      subscriptionActiveAt: new Date(),
      subscriptionPlan: input.planId,
      isActive: true,
      subscriptionStripeCustomerId: input.stripeCustomerId,
      subscriptionStripeSubscriptionId: input.stripeSubscriptionId,
      subscriptionCurrentPeriodStart: input.periodStart,
      subscriptionCurrentPeriodEnd: input.periodEnd,
    },
  });
}

export async function deactivateBusinessSubscription(businessId: string) {
  await prisma.business.update({
    where: { id: businessId },
    data: {
      subscriptionActiveAt: null,
      subscriptionPlan: null,
      subscriptionStripeSubscriptionId: null,
      subscriptionCurrentPeriodStart: null,
      subscriptionCurrentPeriodEnd: null,
      isActive: false,
    },
  });
}

export async function syncBusinessSubscriptionPeriod(
  businessId: string,
  subscription: Stripe.Subscription
) {
  const { periodStart, periodEnd } = subscriptionBillingPeriod(subscription);
  const planId = subscription.metadata.planId;
  const data: {
    subscriptionCurrentPeriodStart: Date;
    subscriptionCurrentPeriodEnd: Date;
    subscriptionActiveAt?: Date;
    subscriptionPlan?: SubscriptionPlanId;
    isActive?: boolean;
  } = {
    subscriptionCurrentPeriodStart: periodStart,
    subscriptionCurrentPeriodEnd: periodEnd,
  };

  if (
    subscription.status === "active" ||
    subscription.status === "trialing"
  ) {
    data.subscriptionActiveAt = new Date();
    data.isActive = true;
    if (planId === "premium" || planId === "ultimate") {
      data.subscriptionPlan = planId;
    }
  }

  await prisma.business.update({
    where: { id: businessId },
    data,
  });
}
