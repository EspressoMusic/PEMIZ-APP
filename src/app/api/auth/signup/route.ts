import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { isSignupEnabled } from "@/lib/platform-config";
import { jsonError, jsonInfrastructureError, jsonOk, jsonServerError } from "@/lib/api";
import { isDatabaseConfigured, databaseConfigHint } from "@/lib/db-env";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { safeUserSelect } from "@/lib/security/user-select";
import { signupSchema, zodFirstError } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const limited = await enforceRateLimit(req, "auth:signup", 5, 60 * 60 * 1000);
  if (limited) return limited;

  if (!(await isSignupEnabled())) {
    return jsonError("ההרשמה סגורה כרגע. נסו שוב מאוחר יותר.", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(zodFirstError(parsed), 400);
  }

  if (!isDatabaseConfigured()) {
    return jsonInfrastructureError(
      `Database not configured. ${databaseConfigHint()}`,
      "auth:signup"
    );
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, business: { select: { id: true } } },
    });
    if (existing) {
      if (!existing.business) {
        return jsonError(
          "האימייל כבר רשום, אך החנות עדיין לא נוצרה. התחבר/י עם אותה סיסמה כדי להמשיך.",
          409
        );
      }
      return jsonError("כבר קיים משתמש עם האימייל הזה", 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.name,
      },
      select: safeUserSelect,
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    return jsonOk({ userId: user.id, email: user.email });
  } catch (error) {
    return jsonServerError(error, "auth:signup");
  }
}
