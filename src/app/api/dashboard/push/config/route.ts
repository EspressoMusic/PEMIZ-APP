import { jsonOk } from "@/lib/api";
import { requireStoreOwner } from "@/lib/dashboard-auth";
import { getVapidPublicKey, isPushConfigured } from "@/lib/seller-push";

export async function GET() {
  const ctx = await requireStoreOwner();
  if (!ctx.ok) return ctx.response;

  return jsonOk({
    configured: isPushConfigured(),
    publicKey: getVapidPublicKey(),
  });
}
