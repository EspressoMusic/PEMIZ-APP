import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { isSubscriptionPaymentsEnabled } from "@/lib/subscription-payments";
import { zodFirstError } from "@/lib/validation/schemas";
import {
  appBaseUrl,
  getStripe,
  stripePriceIdForPlan,
} from "@/lib/stripe-billing";
import type { SubscriptionPlanId } from "@/lib/subscription-plans";

const checkoutSchema = z.object({
  planId: z.enum(["premium", "ultimate"]),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Not signed in", 401);
  if (!user.business) return jsonError("No business", 404);

  if (!isSubscriptionPaymentsEnabled()) {
    return jsonError(
      "Online subscription checkout is not available yet. Your store stays active during the free period.",
      503
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));

  if (user.business.subscriptionActiveAt) {
    return jsonError("You already have an active subscription", 400);
  }

  const stripe = getStripe();
  if (!stripe) {
    return jsonError(
      "Online checkout is not configured yet. Contact support to activate your plan.",
      501
    );
  }

  const planId = parsed.data.planId as SubscriptionPlanId;
  const priceId = stripePriceIdForPlan(planId);
  if (!priceId) {
    return jsonError(
      "This plan is not configured for checkout yet. Contact support.",
      501
    );
  }

  const base = appBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/dashboard/settings?subscription=success`,
    cancel_url: `${base}/trial-expired`,
    metadata: {
      businessId: user.business.id,
      planId,
      userId: user.id,
    },
    subscription_data: {
      metadata: {
        businessId: user.business.id,
        planId,
      },
    },
  });

  if (!session.url) {
    return jsonError("Could not start checkout", 500);
  }

  return jsonOk({ url: session.url });
}
