import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { jsonError, jsonOk } from "@/lib/api";
import { databaseConfigHint, isDatabaseConfigured } from "@/lib/db-env";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  if (!isDatabaseConfigured()) {
    return jsonError(`מסד הנתונים לא מוגדר. ${databaseConfigHint()}`, 503);
  }

  let user;
  try {
    user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
      include: { business: true },
    });
  } catch {
    return jsonError("שגיאת חיבור למסד הנתונים", 503);
  }
  if (!user) return jsonError("אימייל או סיסמה שגויים", 401);

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return jsonError("אימייל או סיסמה שגויים", 401);

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
}
