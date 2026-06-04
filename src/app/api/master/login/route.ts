import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import {
  createMasterSession,
  getMasterKeyFromEnv,
  verifyMasterKey,
} from "@/lib/master-auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { masterLoginSchema, zodFirstError } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "master:login", 8, 15 * 60 * 1000);
  if (limited) return limited;

  if (!getMasterKeyFromEnv()) {
    return jsonError("סיסמת מנהל לא הוגדרה בשרת (MASTER_KEY)", 503);
  }

  const body = await req.json().catch(() => null);
  const parsed = masterLoginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(zodFirstError(parsed), 400);
  }

  if (!verifyMasterKey(parsed.data.password)) {
    return jsonError("סיסמה שגויה", 401);
  }

  await createMasterSession();
  return NextResponse.json({ ok: true });
}
