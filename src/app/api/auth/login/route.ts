import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { jsonError, jsonOk } from "@/lib/api";
import { studioConsolePath } from "@/lib/studio-access";
import { databaseConfigHint, isDatabaseConfigured } from "@/lib/db-env";
import { prismaErrorResponse } from "@/lib/prisma-errors";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { safeUserWithPasswordSelect } from "@/lib/security/user-select";
import { loginSchema, zodFirstError } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "auth:login", 10, 15 * 60 * 1000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(zodFirstError(parsed), 400);
  }

  if (!isDatabaseConfigured()) {
    return jsonError(`מסד הנתונים לא מוגדר. ${databaseConfigHint()}`, 503);
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: safeUserWithPasswordSelect,
    });

    if (!user) {
      return jsonError("לא קיים משתמש עם האימייל הזה", 401);
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
    console.error("login failed", error);
    const { message, status } = prismaErrorResponse(error);
    return jsonError(message, status);
  }
}
