import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdmin } from "@/lib/admin-access";
import { jsonError, jsonOk, jsonServerError } from "@/lib/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { adminUserPatchSchema, zodFirstError } from "@/lib/validation/schemas";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await enforceRateLimit(req, "admin:user-patch", 30, 60 * 60 * 1000);
  if (limited) return limited;

  const denied = await requirePlatformAdmin();
  if (denied) return denied;

  const { id } = await params;
  const raw = await req.json().catch(() => null);
  const parsed = adminUserPatchSchema.safeParse(raw);
  if (!parsed.success) return jsonError(zodFirstError(parsed), 400);

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, email: true },
  });
  if (!user) return jsonError("משתמש לא נמצא", 404);
  if (user.role === "ADMIN") {
    return jsonError("לא ניתן לערוך חשבון מנהל פלטפורמה", 403);
  }

  const data: {
    email?: string;
    passwordHash?: string;
    emailVerified?: boolean;
    emailVerificationToken?: null;
    emailVerificationExpiresAt?: null;
    passwordResetToken?: null;
    passwordResetExpiresAt?: null;
  } = {};

  if (parsed.data.email !== undefined) {
    data.email = parsed.data.email.toLowerCase();
    data.emailVerified = true;
    data.emailVerificationToken = null;
    data.emailVerificationExpiresAt = null;
  }

  if (parsed.data.password !== undefined) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 12);
    data.passwordResetToken = null;
    data.passwordResetExpiresAt = null;
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true },
    });
    return jsonOk({
      user: updated,
      message:
        parsed.data.email !== undefined && parsed.data.password !== undefined
          ? "המייל והסיסמה עודכנו"
          : parsed.data.email !== undefined
            ? "המייל עודכן"
            : "הסיסמה עודכנה",
    });
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : null;
    if (code === "P2002") {
      return jsonError("האימייל כבר בשימוש בחשבון אחר", 409);
    }
    return jsonServerError(error, "admin:users:patch");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requirePlatformAdmin();
  if (denied) return denied;

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { business: true },
  });
  if (!user) return jsonError("משתמש לא נמצא", 404);
  if (user.role === "ADMIN") return jsonError("לא ניתן למחוק מנהל פלטפורמה", 403);

  await prisma.user.delete({ where: { id } });
  return jsonOk({ deleted: true });
}
