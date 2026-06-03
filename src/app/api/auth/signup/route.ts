import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { jsonError, jsonOk } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).max(80),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    include: { business: true },
  });
  if (existing) {
    if (!existing.business) {
      return jsonError(
        "האימייל כבר רשום, אך החנות עדיין לא נוצרה. התחבר/י עם אותה סיסמה כדי להמשיך.",
        409
      );
    }
    return jsonError("אימייל כבר רשום במערכת", 409);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email.toLowerCase(),
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
}
