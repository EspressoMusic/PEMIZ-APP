import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { isGuestLoginAllowed } from "@/lib/auth-guest-dev";
import { generateUniqueBusinessSlug } from "@/lib/business";

export const runtime = "nodejs";

export async function POST() {
  if (!isGuestLoginAllowed()) {
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
