import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { generateUniqueBusinessSlug } from "@/lib/business";

export const runtime = "nodejs";

/**
 * TEST-ONLY guest login for sandbox payment testing.
 *
 * HARD-GATED to Vercel *preview* deployments (VERCEL_ENV === "preview"): it is
 * inert on production (peymiz.com), on localhost, and on any non-Vercel host.
 * This code lives only on the `paddle-sandbox-preview` branch and must NEVER be
 * merged into `main`. Delete the branch after testing.
 */
function guestLoginAllowed(): boolean {
  return process.env.VERCEL_ENV === "preview";
}

export async function POST() {
  if (!guestLoginAllowed()) {
    return jsonError("Not found", 404);
  }

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
      storeLocale: "he",
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
}
