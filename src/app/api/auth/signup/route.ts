import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { isSignupEnabled } from "@/lib/platform-config";
import { jsonError, jsonOk } from "@/lib/api";
import { isDatabaseConfigured, databaseConfigHint } from "@/lib/db-env";
import { prismaErrorResponse } from "@/lib/prisma-errors";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).max(80),
});

export async function POST(req: Request) {
  if (!(await isSignupEnabled())) {
    return jsonError("ההרשמה סגורה כרגע. נסו שוב מאוחר יותר.", 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "נתונים לא תקינים";
    return jsonError(msg, 400);
  }

  if (!isDatabaseConfigured()) {
    return jsonError(`מסד הנתונים לא מוגדר. ${databaseConfigHint()}`, 503);
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      include: { business: true },
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
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    return jsonOk({ userId: user.id, email: user.email });
  } catch (error) {
    console.error("signup failed", error);
    const { message, status } = prismaErrorResponse(error);
    return jsonError(message, status);
  }
}
