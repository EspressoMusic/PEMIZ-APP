import { jsonOk } from "@/lib/api";
import { requirePlatformAdmin } from "@/lib/admin-access";
import { getVapidPublicKey, isPushConfigured } from "@/lib/seller-push";

export async function GET() {
  const denied = await requirePlatformAdmin();
  if (denied) return denied;

  return jsonOk({
    configured: isPushConfigured(),
    publicKey: getVapidPublicKey(),
  });
}
