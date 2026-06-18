import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import type { Role } from "@/lib/types";
import { isSignupEnabled } from "@/lib/platform-config";
import { jsonError, jsonInfrastructureError, jsonOk, jsonServerError } from "@/lib/api";
import { isDatabaseConfigured, databaseConfigHint } from "@/lib/db-env";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { safeUserSelect } from "@/lib/security/user-select";
import { signupSchemaForLocale, zodFirstError } from "@/lib/validation/schemas";
import { parseIsraeliMobilePhone } from "@/lib/phone";
import { syntheticOwnerEmail } from "@/lib/owner-auth-phone";
import { getAuthMessages, readLocaleFromRequest } from "@/lib/auth-messages";

export async function POST(req: Request) {
  const locale = readLocaleFromRequest(req);
  const msg = getAuthMessages(locale);
  const limited = await enforceRateLimit(req, "auth:signup", 5, 60 * 60 * 1000);
  if (limited) return limited;

  if (!(await isSignupEnabled())) {
    return jsonError(msg.signupsClosed, 403);
  }

  const body = await req.json().catch(() => null);
  const parsed = signupSchemaForLocale(locale).safeParse(body);
  if (!parsed.success) {
    return jsonError(zodFirstError(parsed, locale), 400);
  }

  if (!isDatabaseConfigured()) {
    return jsonInfrastructureError(
      `Database not configured. ${databaseConfigHint()}`,
      "auth:signup"
    );
  }

  const phone = parseIsraeliMobilePhone(parsed.data.phone);
  if (!phone) return jsonError(msg.invalidPhone, 400);

  const email = syntheticOwnerEmail(phone);
  if (!email) return jsonError(msg.invalidPhone, 400);

  try {
    const existingByPhone = await prisma.user.findFirst({
      where: { phone },
      select: { id: true, business: { select: { id: true } } },
    });
    if (existingByPhone) {
      if (!existingByPhone.business) {
        return jsonError(msg.accountExistsNoStore, 409);
      }
      return jsonError(msg.accountExists, 409);
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingByEmail) {
      return jsonError(msg.accountExists, 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.name,
        phone,
        phoneVerified: true,
      },
      select: safeUserSelect,
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    });

    return jsonOk({ userId: user.id, phone: user.phone });
  } catch (error) {
    return jsonServerError(error, "auth:signup");
  }
}
