import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const EXPIRY_HOURS = 24;

export function buildVerificationUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
}

export async function issueEmailVerification(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: token,
      emailVerificationExpiresAt: expiresAt,
      emailVerified: false,
    },
  });

  return { token, verifyUrl: buildVerificationUrl(token), expiresAt };
}

export async function verifyEmailToken(token: string) {
  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: token },
    include: { business: true },
  });

  if (!user) return { ok: false as const, error: "קישור לא תקין" };
  if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
    return { ok: false as const, error: "הקישור פג תוקף" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
  });

  return { ok: true as const, userId: user.id };
}

export async function sendOwnerVerificationEmail(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const { verifyUrl } = await issueEmailVerification(userId);
  const { sendVerificationEmail } = await import("@/lib/email");
  return sendVerificationEmail(user.email, verifyUrl, user.name);
}
