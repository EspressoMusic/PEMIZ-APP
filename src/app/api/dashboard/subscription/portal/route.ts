import { jsonError, jsonOk } from "@/lib/api";
import {
  canOpenBillingPortal,
  externalCustomerIdForBusiness,
  externalSubscriptionIdForBusiness,
} from "@/lib/billing/business-billing-ids";
import { getConfiguredBillingProvider } from "@/lib/billing/providers";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { isSubscriptionPaymentsEnabled } from "@/lib/subscription-payments";

export async function POST() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  if (!isSubscriptionPaymentsEnabled()) {
    return jsonError(
      "Online subscription billing is not available yet.",
      503
    );
  }

  const business = ctx.user.business;
  if (!canOpenBillingPortal(business)) {
    return jsonError(
      "No active billing account yet. Choose a plan first.",
      400
    );
  }

  const customerId = externalCustomerIdForBusiness(business);
  if (!customerId) {
    return jsonError("Billing customer not found.", 400);
  }

  const provider = getConfiguredBillingProvider();
  if (!provider.isConfigured()) {
    return jsonError(
      "Billing portal is not configured yet. Contact support.",
      501
    );
  }

  const portal = await provider.createBillingPortalSession({
    externalCustomerId: customerId,
    externalSubscriptionId: externalSubscriptionIdForBusiness(business),
  });

  if (!portal.ok) {
    return jsonError(portal.message, portal.status);
  }

  return jsonOk({ url: portal.url, provider: provider.id });
}
