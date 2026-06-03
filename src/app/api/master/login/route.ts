import { createMasterSession, getMasterKeyFromEnv, verifyMasterKey } from "@/lib/master-auth";
import { jsonError, jsonOk } from "@/lib/api";

export async function POST(req: Request) {
  if (!getMasterKeyFromEnv()) {
    return jsonError("כניסת מפתח לא מוגדרת בשרת", 503);
  }

  const body = await req.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key : "";
  if (!key) return jsonError("יש להזין מפתח");

  if (!verifyMasterKey(key)) {
    return jsonError("מפתח שגוי", 401);
  }

  await createMasterSession();
  return jsonOk({ ok: true });
}
