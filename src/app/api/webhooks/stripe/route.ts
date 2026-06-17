import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  activateBusinessSubscription,
  deactivateBusinessSubscription,
  getStripe,
  subscriptionBillingPeriod,
  syncBusinessSubscriptionPeriod,
} from "@/lib/stripe-billing";
import type { SubscriptionPlanId } from "@/lib/subscription-plans";

export const runtime = "nodejs";

async function businessIdFromSubscription(
  subscription: Stripe.Subscription
): Promise<string | null> {
  if (subscription.metadata.businessId) {
    return subscription.metadata.businessId;
  }
  const business = await prisma.business.findFirst({
    where: { subscriptionStripeSubscriptionId: subscription.id },
    select: { id: true },
  });
  return business?.id ?? null;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !webhookSecret) {
    return new Response("Stripe webhook not configured", { status: 501 });
  }

  const body = await req.text();
  const headerStore = await headers();
  const signature = headerStore.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const businessId = session.metadata?.businessId;
        const planId = session.metadata?.planId as SubscriptionPlanId | undefined;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        if (!businessId || !planId || !subscriptionId || !customerId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const { periodStart, periodEnd } = subscriptionBillingPeriod(subscription);
        await activateBusinessSubscription({
          businessId,
          planId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          periodStart,
          periodEnd,
        });
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const businessId = await businessIdFromSubscription(subscription);
        if (!businessId) break;
        if (
          subscription.status === "active" ||
          subscription.status === "trialing"
        ) {
          await syncBusinessSubscriptionPeriod(businessId, subscription);
        } else if (
          subscription.status === "canceled" ||
          subscription.status === "unpaid" ||
          subscription.status === "incomplete_expired"
        ) {
          await deactivateBusinessSubscription(businessId);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const businessId = await businessIdFromSubscription(subscription);
        if (!businessId) break;
        await deactivateBusinessSubscription(businessId);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("stripe webhook handler failed", error);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
