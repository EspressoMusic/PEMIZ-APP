import { jsonOk } from "@/lib/api";
import { requireSellerAlertsOwner } from "@/lib/dashboard-auth";
import { getVapidPublicKey, isPushConfigured } from "@/lib/seller-push";

export async function GET() {
  const ctx = await requireSellerAlertsOwner();
  if (!ctx.ok) return ctx.response;

  return jsonOk({
    configured: isPushConfigured(),
    publicKey: getVapidPublicKey(),
  });
}
