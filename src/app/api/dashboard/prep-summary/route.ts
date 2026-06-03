import { getCurrentUser } from "@/lib/auth";
import { getPrepSummaryForBusiness } from "@/lib/dashboard-prep-summary";
import { jsonError, jsonOk } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const products = await getPrepSummaryForBusiness(user.business.id);
  return jsonOk({ products });
}
