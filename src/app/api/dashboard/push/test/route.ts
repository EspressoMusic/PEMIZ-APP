import { jsonError, jsonOk } from "@/lib/api";
import { requireSellerAlertsOwner } from "@/lib/dashboard-auth";
import { isPushConfigured, sendTestPushToOwner } from "@/lib/seller-push";

export async function POST() {
  const ctx = await requireSellerAlertsOwner();
  if (!ctx.ok) return ctx.response;
  if (!isPushConfigured()) {
    return jsonError("התראות דחיפה לא מוגדרות בשרת", 503);
  }

  const result = await sendTestPushToOwner(ctx.user.id);
  return jsonOk(result);
}
