import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { parseIsraeliMobilePhone } from "@/lib/phone";
import { syntheticOwnerEmail } from "@/lib/owner-auth-phone";
import { recordSystemIncident } from "@/lib/system-incidents";
import { safeUserSelect } from "@/lib/security/user-select";

const EXPIRY_HOURS = 1;

export function buildPasswordResetUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/reset-password?token=${encodeURIComponent(token)}`;
}

async function findUserByPhone(phone: string) {
  const normalized = parseIsraeliMobilePhone(phone);
  if (!normalized) return null;

  let user = await prisma.user.findFirst({
    where: { phone: normalized },
    select: safeUserSelect,
  });

  if (!user) {
    const syntheticEmail = syntheticOwnerEmail(normalized);
    if (syntheticEmail) {
      user = await prisma.user.findUnique({
        where: { email: syntheticEmail },
        select: safeUserSelect,
      });
    }
  }

  return user;
}

/** Manual reset via email link — kept for admin / legacy token flow. */
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

export async function requestPasswordResetByPhone(phone: string) {
  const normalized = parseIsraeliMobilePhone(phone);
  if (!normalized) return;

  const user = await findUserByPhone(phone);

  recordSystemIncident({
    context: "auth:password-reset-request",
    publicMessage: "בקשת איפוס סיסמה",
    developerMessage: user
      ? `בקשת איפוס סיסמה: ${user.name}, טלפון ${normalized}, אימייל ${user.email}`
      : `בקשת איפוס סיסמה מטלפון שלא נמצא במערכת: ${normalized}`,
  });

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Linky Password Reset Request] ${normalized}${
        user ? ` (${user.name})` : " (unknown phone)"
      }`
    );
  }
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
