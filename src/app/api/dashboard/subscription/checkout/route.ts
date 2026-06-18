import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getConfiguredBillingProvider } from "@/lib/billing/providers";
import { isSubscriptionPaymentsEnabled } from "@/lib/subscription-payments";
import { zodFirstError } from "@/lib/validation/schemas";
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

  const provider = getConfiguredBillingProvider();
  if (!provider.isConfigured()) {
    return jsonError(
      "Online checkout is not configured yet. Contact support to activate your plan.",
      501
    );
  }

  const planId = parsed.data.planId as SubscriptionPlanId;
  const checkout = await provider.createCheckoutSession({
    planId,
    businessId: user.business.id,
    userId: user.id,
    customerEmail: user.email,
  });

  if (!checkout.ok) {
    return jsonError(checkout.message, checkout.status);
  }

  return jsonOk({ url: checkout.url, provider: provider.id });
}
