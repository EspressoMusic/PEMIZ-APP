import { createHmac, timingSafeEqual } from "crypto";
import { paddleBillingLog } from "@/lib/billing/paddle-billing-log";
import {
  activateBusinessSubscription,
  deactivateBusinessSubscription,
  findBusinessIdByExternalSubscriptionId,
  syncBusinessSubscriptionPeriod,
} from "@/lib/billing/subscription-store";
import {
  paddleSubscriptionIsActive,
  paddleSubscriptionIsInactive,
  paddleSubscriptionPeriod,
  parsePaddleBusinessId,
  parsePaddlePlanId,
  type PaddleSubscriptionPayload,
} from "@/lib/billing/providers/paddle-provider";

export const runtime = "nodejs";

const WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000;

function verifyPaddleSignature(body: string, signatureHeader: string): boolean {
  const secret =
    process.env.PADDLE_WEBHOOK_SECRET?.trim() ||
    process.env.PADDLE_WEBHOOK_SECRET_KEY?.trim();
  if (!secret) return false;

  const parts = signatureHeader.split(";");
  if (parts.length !== 2) return false;

  const timestamp = parts[0]?.split("=")[1];
  const signature = parts[1]?.split("=")[1];
  if (!timestamp || !signature) return false;

  const timestampMs = Number.parseInt(timestamp, 10) * 1000;
  if (Number.isNaN(timestampMs)) return false;
  if (Date.now() - timestampMs > WEBHOOK_MAX_AGE_MS) return false;

  const signedPayload = `${timestamp}:${body}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function handlePaddleSubscription(
  subscription: PaddleSubscriptionPayload,
  eventType: string
) {
  const businessIdFromCustomData = parsePaddleBusinessId(subscription.custom_data);
  const businessId =
    businessIdFromCustomData ??
    (await findBusinessIdByExternalSubscriptionId("paddle", subscription.id));

  if (!businessId) {
    paddleBillingLog("business_not_matched", {
      eventType,
      subscriptionId: subscription.id,
      status: subscription.status,
      customData: subscription.custom_data ?? null,
    });
    return;
  }

  paddleBillingLog("business_matched", {
    eventType,
    businessId,
    subscriptionId: subscription.id,
    status: subscription.status,
    matchSource: businessIdFromCustomData ? "custom_data" : "external_subscription_id",
    userId: subscription.custom_data?.userId ?? null,
  });

  const { periodStart, periodEnd } = paddleSubscriptionPeriod(subscription);
  const planId = parsePaddlePlanId(subscription.custom_data);

  if (paddleSubscriptionIsActive(subscription.status)) {
    if (planId && subscription.customer_id) {
      await activateBusinessSubscription({
        businessId,
        planId,
        provider: "paddle",
        externalCustomerId: subscription.customer_id,
        externalSubscriptionId: subscription.id,
        periodStart,
        periodEnd,
      });
      paddleBillingLog("subscription_activated", {
        eventType,
        businessId,
        planId,
        subscriptionId: subscription.id,
        customerId: subscription.customer_id,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      });
      return;
    }

    await syncBusinessSubscriptionPeriod({
      businessId,
      planId,
      periodStart,
      periodEnd,
      active: true,
    });
    return;
  }

  if (paddleSubscriptionIsInactive(subscription.status)) {
    await deactivateBusinessSubscription(businessId);
    paddleBillingLog("subscription_deactivated", {
      eventType,
      businessId,
      subscriptionId: subscription.id,
      status: subscription.status,
    });
  }
}

export async function POST(req: Request) {
  const webhookSecret =
    process.env.PADDLE_WEBHOOK_SECRET?.trim() ||
    process.env.PADDLE_WEBHOOK_SECRET_KEY?.trim();
  if (!webhookSecret) {
    return new Response("Paddle webhook not configured", { status: 501 });
  }

  const body = await req.text();
  const signature = req.headers.get("paddle-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  if (!verifyPaddleSignature(body, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: {
    event_type?: string;
    data?: PaddleSubscriptionPayload;
  };
  try {
    payload = JSON.parse(body) as {
      event_type?: string;
      data?: PaddleSubscriptionPayload;
    };
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventType = payload.event_type ?? "unknown";

  try {
    paddleBillingLog("webhook_received", {
      eventType,
      environment: process.env.PADDLE_ENVIRONMENT?.trim().toLowerCase() ?? "production",
      subscriptionId: payload.data?.id ?? null,
      status: payload.data?.status ?? null,
    });

    switch (eventType) {
      case "subscription.activated":
      case "subscription.updated":
      case "subscription.trialing":
      case "subscription.created":
        if (payload.data) {
          await handlePaddleSubscription(payload.data, eventType);
        }
        break;
      case "subscription.canceled":
      case "subscription.past_due":
      case "subscription.paused":
        if (payload.data) {
          await handlePaddleSubscription(payload.data, eventType);
        }
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("paddle webhook handler failed", error);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
