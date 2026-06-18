import Stripe from "stripe";
import { appBaseUrl } from "@/lib/billing/app-base-url";
import type {
  SubscriptionBillingProvider,
  SubscriptionCheckoutInput,
  SubscriptionCheckoutResult,
} from "@/lib/billing/types";
import type { SubscriptionPlanId } from "@/lib/subscription-plans";

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

export function subscriptionBillingPeriod(subscription: Stripe.Subscription) {
  const raw = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
    currentPeriodStart?: number;
    currentPeriodEnd?: number;
  };
  const startSec =
    raw.current_period_start ??
    raw.currentPeriodStart ??
    Math.floor(Date.now() / 1000);
  const endSec =
    raw.current_period_end ??
    raw.currentPeriodEnd ??
    startSec + 30 * 24 * 60 * 60;
  return {
    periodStart: new Date(startSec * 1000),
    periodEnd: new Date(endSec * 1000),
  };
}

export const stripeBillingProvider: SubscriptionBillingProvider = {
  id: "stripe",

  isConfigured() {
    return Boolean(getStripe() && stripePriceIdForPlan("premium"));
  },

  async createCheckoutSession(
    input: SubscriptionCheckoutInput
  ): Promise<SubscriptionCheckoutResult> {
    const stripe = getStripe();
    if (!stripe) {
      return {
        ok: false,
        status: 501,
        message:
          "Stripe checkout is not configured yet. Contact support to activate your plan.",
      };
    }

    const priceId = stripePriceIdForPlan(input.planId);
    if (!priceId) {
      return {
        ok: false,
        status: 501,
        message:
          "This plan is not configured for checkout yet. Contact support.",
      };
    }

    const base = appBaseUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: input.customerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/dashboard/settings?subscription=success`,
      cancel_url: `${base}/trial-expired`,
      metadata: {
        businessId: input.businessId,
        planId: input.planId,
        userId: input.userId,
      },
      subscription_data: {
        metadata: {
          businessId: input.businessId,
          planId: input.planId,
        },
      },
    });

    if (!session.url) {
      return {
        ok: false,
        status: 500,
        message: "Could not start checkout",
      };
    }

    return { ok: true, url: session.url };
  },
};
