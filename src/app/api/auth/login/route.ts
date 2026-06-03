import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { jsonError, jsonOk } from "@/lib/api";
import { databaseConfigHint, isDatabaseConfigured } from "@/lib/db-env";
import { prismaErrorResponse } from "@/lib/prisma-errors";

const schema = z.object({
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(1, "נא להזין סיסמה"),
});

export async function POST(req: Request) {
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
    const user = await prisma.user.findUnique({
      where: { email },
      include: { business: true },
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

    return jsonOk({
      userId: user.id,
      role: user.role,
      emailVerified: user.emailVerified,
      hasBusiness: !!user.business,
      businessActive: user.business?.isActive ?? false,
    });
  } catch (error) {
    console.error("login failed", error);
    const { message, status } = prismaErrorResponse(error);
    return jsonError(message, status);
  }
}
