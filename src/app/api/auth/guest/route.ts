import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { jsonError, jsonInfrastructureError, jsonOk, jsonServerError } from "@/lib/api";
import { isGuestLoginAllowed } from "@/lib/auth-guest-dev";
import { generateUniqueBusinessSlug } from "@/lib/business";
import { isDatabaseConfigured, databaseConfigHint } from "@/lib/db-env";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { SITE_LOCALE } from "@/lib/site-locale";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isGuestLoginAllowed()) {
    return jsonError("Guest login is only available in preview and local dev.", 404);
  }

  const limited = await enforceRateLimit(req, "auth:guest", 10, 15 * 60 * 1000);
  if (limited) return limited;

  if (!isDatabaseConfigured()) {
    return jsonInfrastructureError(
      `Database not configured. ${databaseConfigHint()}`,
      "auth:guest"
    );
  }

  try {
    const suffix = randomBytes(6).toString("hex");
    const email = `guest-${Date.now()}-${suffix}@preview.peymiz.test`;
    const passwordHash = await bcrypt.hash(
      randomBytes(32).toString("hex"),
      12
    );

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: "Guest Tester",
        emailVerified: true,
        role: "OWNER",
      },
      select: { id: true, email: true },
    });

    const slug = await generateUniqueBusinessSlug("guest-test-store");
    await prisma.business.create({
      data: {
        name: "🧪 Guest Test Store",
        slug,
        description: "Sandbox payment test store — safe to delete.",
        type: "STORE",
        storeLocale: SITE_LOCALE,
        ownerId: user.id,
        termsAcceptedAt: new Date(),
        isActive: true,
        approvedAt: new Date(),
      },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: "OWNER",
    });

    return jsonOk({ redirectTo: "/dashboard" });
  } catch (error) {
    return jsonServerError(error, "auth:guest");
  }
}
