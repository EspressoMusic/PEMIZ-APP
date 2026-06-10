import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { jsonError, jsonInfrastructureError, jsonOk, jsonServerError } from "@/lib/api";
import { studioConsolePath } from "@/lib/studio-access";
import { databaseConfigHint, isDatabaseConfigured } from "@/lib/db-env";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { safeUserWithPasswordSelect } from "@/lib/security/user-select";
import { loginSchema, zodFirstError } from "@/lib/validation/schemas";
import { parseIsraeliMobilePhone } from "@/lib/phone";
import { syntheticOwnerEmail } from "@/lib/owner-auth-phone";

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "auth:login", 10, 15 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(zodFirstError(parsed), 400);
  }

  if (!isDatabaseConfigured()) {
    return jsonInfrastructureError(
      `Database not configured. ${databaseConfigHint()}`,
      "auth:login"
    );
  }

  const identifier = parsed.data.identifier.trim();

  try {
    const phone = parseIsraeliMobilePhone(identifier);
    let user =
      phone != null
        ? await prisma.user.findFirst({
            where: { phone },
            select: safeUserWithPasswordSelect,
          })
        : null;

    if (!user && phone) {
      const syntheticEmail = syntheticOwnerEmail(phone);
      if (syntheticEmail) {
        user = await prisma.user.findUnique({
          where: { email: syntheticEmail },
          select: safeUserWithPasswordSelect,
        });
      }
    }

    if (!user && identifier.includes("@")) {
      user = await prisma.user.findUnique({
        where: { email: identifier.toLowerCase() },
        select: safeUserWithPasswordSelect,
      });
    }

    if (!user) {
      return jsonError("לא קיים משתמש עם הטלפון הזה", 401);
    }

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
      return jsonError("הסיסמה שגויה", 401);
    }

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
      hasBusiness: !!user.business,
      businessActive: user.business?.isActive ?? false,
      redirectTo: consolePath,
    });
  } catch (error) {
    return jsonServerError(error, "auth:login");
  }
}
