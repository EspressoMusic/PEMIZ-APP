import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import {
  createMasterSession,
  getMasterKeyFromEnv,
  verifyMasterKey,
} from "@/lib/master-auth";
import {
  isMasterKeyStrongEnough,
  isMasterLoginAllowedFromIp,
} from "@/lib/master-access-guard";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { masterLoginSchema, zodFirstError } from "@/lib/validation/schemas";
import { prisma } from "@/lib/prisma";

/** Best-effort — a logging failure must never block a real login. */
async function recordLoginAttempt(req: Request, success: boolean) {
  try {
    await prisma.masterLoginAttempt.create({
      data: {
        ip: getClientIp(req),
        userAgent: req.headers.get("user-agent") ?? undefined,
        success,
      },
    });
  } catch (error) {
    console.error("[master] failed to record login attempt", error);
  }
}

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "master:login", 8, 15 * 60 * 1000);
  if (limited) return limited;

  if (!isMasterLoginAllowedFromIp(req)) {
    return jsonError("גישה נחסמה", 403);
  }

  const masterKey = getMasterKeyFromEnv();
  if (!masterKey) {
    return jsonError("סיסמת מנהל לא הוגדרה בשרת (MASTER_KEY)", 503);
  }

  if (
    process.env.NODE_ENV === "production" &&
    !isMasterKeyStrongEnough(masterKey)
  ) {
    console.error(
      "[master] MASTER_KEY is shorter than 16 characters — use a long random password and rotate periodically"
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = masterLoginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(zodFirstError(parsed), 400);
  }

  if (!verifyMasterKey(parsed.data.password)) {
    await recordLoginAttempt(req, false);
    return jsonError("סיסמה שגויה", 401);
  }

  await recordLoginAttempt(req, true);
  await createMasterSession();
  return NextResponse.json({ ok: true });
}
