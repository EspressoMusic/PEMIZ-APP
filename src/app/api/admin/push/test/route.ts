import { jsonError, jsonOk } from "@/lib/api";
import { requirePlatformAdmin } from "@/lib/admin-access";
import { isPushConfigured } from "@/lib/seller-push";
import { sendTestPushToMaster } from "@/lib/master-push";

export async function POST() {
  const denied = await requirePlatformAdmin();
  if (denied) return denied;
  if (!isPushConfigured()) {
    return jsonError("התראות דחיפה לא מוגדרות בשרת", 503);
  }

  const result = await sendTestPushToMaster();
  return jsonOk(result);
}
