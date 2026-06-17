import { jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import { getSubscriptionUsageStatus } from "@/lib/subscription-usage";
import { getBusinessTrialStatus } from "@/lib/business-trial";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const business = ctx.user.business;
  const trial = getBusinessTrialStatus(business);
  const usage = await getSubscriptionUsageStatus(business);

  return jsonOk({
    trial,
    usage,
    subscriptionPlan: business.subscriptionPlan,
    subscriptionActiveAt: business.subscriptionActiveAt?.toISOString() ?? null,
  });
}
