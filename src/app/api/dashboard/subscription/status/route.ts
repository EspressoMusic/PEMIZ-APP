import { jsonOk } from "@/lib/api";
import { canOpenBillingPortal } from "@/lib/billing/business-billing-ids";
import { getConfiguredBillingProvider } from "@/lib/billing/providers";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { getSubscriptionUsageStatus } from "@/lib/subscription-usage";
import { getBusinessTrialStatus } from "@/lib/business-trial";
import { isSubscriptionPaymentsEnabled } from "@/lib/subscription-payments";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const business = ctx.user.business;
  const trial = getBusinessTrialStatus(business);
  const usage = await getSubscriptionUsageStatus(business);
  const paymentsEnabled = isSubscriptionPaymentsEnabled();
  const providerConfigured = getConfiguredBillingProvider().isConfigured();

  return jsonOk({
    trial: {
      ...trial,
      trialEndsAt: trial.trialEndsAt.toISOString(),
    },
    usage: {
      ...usage,
      periodStart: usage.periodStart.toISOString(),
      periodEnd: usage.periodEnd.toISOString(),
    },
    subscriptionPlan: business.subscriptionPlan,
    subscriptionActiveAt: business.subscriptionActiveAt?.toISOString() ?? null,
    paymentsEnabled,
    providerConfigured,
    billingPortalAvailable:
      paymentsEnabled && providerConfigured && canOpenBillingPortal(business),
  });
}
