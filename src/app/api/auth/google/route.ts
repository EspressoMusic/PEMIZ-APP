import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { isSignupEnabled } from "@/lib/platform-config";
import { jsonError, jsonInfrastructureError, jsonOk, jsonServerError } from "@/lib/api";
import { isDatabaseConfigured, databaseConfigHint } from "@/lib/db-env";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { safeUserSelect } from "@/lib/security/user-select";
import { getAuthMessages, readLocaleFromRequest } from "@/lib/auth-messages";
import { verifyGoogleIdToken } from "@/lib/firebase/verify-google-id-token";
import { isFirebaseAuthConfigured } from "@/lib/firebase/config";
import { studioConsolePath } from "@/lib/studio-access";
import { resolveOwnerBusiness } from "@/lib/owner-login";
import { z } from "zod";

const schema = z.object({
  firebaseIdToken: z.string().min(1),
  allowCreate: z.boolean().optional(),
});

export async function POST(req: Request) {
  const locale = readLocaleFromRequest(req);
  const msg = getAuthMessages(locale);
  const limited = await enforceRateLimit(req, "auth:google", 10, 15 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError(msg.googleVerificationRequired, 400);
  }

  if (!isDatabaseConfigured()) {
    return jsonInfrastructureError(
      `Database not configured. ${databaseConfigHint()}`,
      "auth:google"
    );
  }

  if (!isFirebaseAuthConfigured()) {
    return jsonError(msg.firebaseAuthNotConfigured, 503);
  }

  const verified = await verifyGoogleIdToken(parsed.data.firebaseIdToken, {
    googleVerificationFailed: msg.googleVerificationFailed,
    googleVerificationRequired: msg.googleVerificationRequired,
  });
  if (!verified.ok) {
    return jsonError(verified.error, 401);
  }

  const { email, name } = verified.identity;

  try {
    let user = await prisma.user.findUnique({
      where: { email },
      select: safeUserSelect,
    });

    if (!user) {
      if (!parsed.data.allowCreate) {
        return jsonError(msg.noAccountFound, 401);
      }
      if (!(await isSignupEnabled())) {
        return jsonError(msg.signupsClosed, 403);
      }

      const passwordHash = await bcrypt.hash(
        crypto.randomBytes(32).toString("hex"),
        12
      );
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          emailVerified: true,
        },
        select: safeUserSelect,
      });
    }

    const business = await resolveOwnerBusiness(user);

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    const consolePath =
      user.role === "ADMIN" ? studioConsolePath() || undefined : undefined;

    return jsonOk({
      userId: user.id,
      role: user.role,
      emailVerified: user.emailVerified,
      hasBusiness: !!business,
      businessActive: business?.isActive ?? false,
      redirectTo: consolePath,
      isNewUser: !business,
    });
  } catch (error) {
    return jsonServerError(error, "auth:google");
  }
}
