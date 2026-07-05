import type {
  BillingPortalInput,
  SubscriptionBillingProvider,
  SubscriptionCheckoutInput,
  SubscriptionCheckoutResult,
} from "@/lib/billing/types";
import { paddleBillingLog } from "@/lib/billing/paddle-billing-log";
import { buildPaddleCheckoutPageUrl } from "@/lib/paddle-client-config";
import type { SubscriptionPlanId } from "@/lib/subscription-plans";

function paddleApiBaseUrl(): string {
  const env = process.env.PADDLE_ENVIRONMENT?.trim().toLowerCase();
  if (env === "sandbox") return "https://sandbox-api.paddle.com";
  return "https://api.paddle.com";
}

function paddleApiKey(): string | null {
  return process.env.PADDLE_API_KEY?.trim() || null;
}

export function paddlePriceIdForPlan(planId: SubscriptionPlanId): string | null {
  if (planId === "premium") {
    return process.env.PADDLE_PRICE_PREMIUM?.trim() || null;
  }
  if (planId === "ultimate") {
    return process.env.PADDLE_PRICE_ULTIMATE?.trim() || null;
  }
  return null;
}

type PaddleApiEnvelope<T> = {
  data?: T;
  error?: { detail?: string; message?: string };
};

type PaddleTransaction = {
  id: string;
};

async function paddleRequest<T>(
  path: string,
  init: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const apiKey = paddleApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 501,
      message: "Paddle API key is not configured.",
    };
  }

  const res = await fetch(`${paddleApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const body = (await res.json().catch(() => ({}))) as PaddleApiEnvelope<T>;
  if (!res.ok) {
    const message =
      body.error?.detail ??
      body.error?.message ??
      "Paddle checkout request failed.";
    return { ok: false, status: res.status, message };
  }

  if (!body.data) {
    return {
      ok: false,
      status: 500,
      message: "Paddle returned an empty checkout response.",
    };
  }

  return { ok: true, data: body.data };
}

export const paddleBillingProvider: SubscriptionBillingProvider = {
  id: "paddle",

  isConfigured() {
    return Boolean(paddleApiKey() && paddlePriceIdForPlan("premium"));
  },

  async createCheckoutSession(
    input: SubscriptionCheckoutInput
  ): Promise<SubscriptionCheckoutResult> {
    const priceId = paddlePriceIdForPlan(input.planId);
    if (!priceId) {
      return {
        ok: false,
        status: 501,
        message:
          "This plan is not configured for Paddle checkout yet. Contact support.",
      };
    }

    const created = await paddleRequest<PaddleTransaction>("/transactions", {
      method: "POST",
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        custom_data: {
          businessId: input.businessId,
          planId: input.planId,
          userId: input.userId,
        },
        customer: {
          email: input.customerEmail,
        },
      }),
    });

    if (!created.ok) {
      return {
        ok: false,
        status: created.status,
        message: created.message,
      };
    }

    const transactionId = created.data.id?.trim();
    if (!transactionId) {
      return {
        ok: false,
        status: 500,
        message: "Paddle did not return a transaction ID.",
      };
    }

    paddleBillingLog("checkout_created", {
      environment: process.env.PADDLE_ENVIRONMENT?.trim().toLowerCase() ?? "production",
      transactionId,
      businessId: input.businessId,
      planId: input.planId,
      userId: input.userId,
      checkoutUrl: buildPaddleCheckoutPageUrl(transactionId),
    });

    return { ok: true, url: buildPaddleCheckoutPageUrl(transactionId) };
  },

  async createBillingPortalSession(
    input: BillingPortalInput
  ): Promise<SubscriptionCheckoutResult> {
    const body: { subscription_ids?: string[] } = {};
    const subscriptionId = input.externalSubscriptionId?.trim();
    if (subscriptionId) {
      body.subscription_ids = [subscriptionId];
    }

    const created = await paddleRequest<{
      urls?: { general?: { overview?: string | null } };
    }>(`/customers/${input.externalCustomerId}/portal-sessions`, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!created.ok) {
      return {
        ok: false,
        status: created.status,
        message: created.message,
      };
    }

    const portalUrl = created.data.urls?.general?.overview?.trim();
    if (!portalUrl) {
      return {
        ok: false,
        status: 500,
        message: "Paddle did not return a billing portal URL.",
      };
    }

    return { ok: true, url: portalUrl };
  },
};

export type PaddleSubscriptionPayload = {
  id: string;
  status: string;
  customer_id?: string | null;
  custom_data?: Record<string, string | undefined> | null;
  current_billing_period?: {
    starts_at?: string | null;
    ends_at?: string | null;
  } | null;
};

export function paddleSubscriptionPeriod(subscription: PaddleSubscriptionPayload) {
  const startRaw = subscription.current_billing_period?.starts_at;
  const endRaw = subscription.current_billing_period?.ends_at;
  const periodStart = startRaw ? new Date(startRaw) : new Date();
  const periodEnd = endRaw
    ? new Date(endRaw)
    : new Date(periodStart.getTime() + 30 * 24 * 60 * 60 * 1000);
  return { periodStart, periodEnd };
}

export function parsePaddlePlanId(
  customData: Record<string, string | undefined> | null | undefined
): SubscriptionPlanId | null {
  const planId = customData?.planId;
  if (planId === "premium" || planId === "ultimate") return planId;
  return null;
}

export function parsePaddleBusinessId(
  customData: Record<string, string | undefined> | null | undefined
): string | null {
  const businessId = customData?.businessId?.trim();
  return businessId || null;
}

export function paddleSubscriptionIsActive(status: string): boolean {
  return status === "active" || status === "trialing";
}

export function paddleSubscriptionIsInactive(status: string): boolean {
  return (
    status === "canceled" ||
    status === "past_due" ||
    status === "paused" ||
    status === "inactive"
  );
}
