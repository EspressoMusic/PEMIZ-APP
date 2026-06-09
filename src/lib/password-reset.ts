import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const EXPIRY_HOURS = 1;

export function buildPasswordResetUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function issuePasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user) return null;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpiresAt: expiresAt,
    },
  });

  const resetUrl = buildPasswordResetUrl(token);
  const { sendPasswordResetEmail } = await import("@/lib/email");
  const mail = await sendPasswordResetEmail(user.email, resetUrl, user.name);

  if (process.env.NODE_ENV === "development") {
    console.log(`[Linky Password Reset] ${user.email}: ${resetUrl}`);
  }

  return { sent: mail.sent };
}

export async function resetPasswordWithToken(token: string, password: string) {
  const user = await prisma.user.findFirst({
    where: { passwordResetToken: token },
  });

  if (!user) return { ok: false as const, error: "קישור לא תקין" };
  if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
    return { ok: false as const, error: "הקישור פג תוקף — בקש קישור חדש" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  return { ok: true as const };
}
