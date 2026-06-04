import { getPrepSummaryForBusiness } from "@/lib/dashboard-prep-summary";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;
  const products = await getPrepSummaryForBusiness(ctx.user.business.id);
  return jsonOk({ products });
}
