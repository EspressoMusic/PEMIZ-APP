type PaddleBillingLogPayload = Record<string, unknown>;

/** Structured Paddle billing logs — filter Vercel/runtime logs with `[paddle]`. */
export function paddleBillingLog(
  event:
    | "checkout_created"
    | "webhook_received"
    | "business_matched"
    | "business_not_matched"
    | "subscription_activated"
    | "subscription_deactivated",
  payload: PaddleBillingLogPayload = {}
) {
  console.log("[paddle]", event, payload);
}
