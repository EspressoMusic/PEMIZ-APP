import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, generateOtp } from "@/lib/auth";
import { OTP_EXPIRY_MINUTES } from "@/lib/constants";
import { jsonError, jsonOk } from "@/lib/api";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  INVALID_PHONE_MESSAGE_HE,
  parseIsraeliMobilePhone,
} from "@/lib/phone";
import { customerPhoneSchema } from "@/lib/validation/schemas";

const schema = z.object({
  phone: customerPhoneSchema,
});

export async function POST(req: Request) {
  const limited = enforceRateLimit(req, "phone:send", 5, 15 * 60 * 1000);
  if (limited) return limited;

  const user = await getCurrentUser();
  if (!user) return jsonError("לא מחובר", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError(INVALID_PHONE_MESSAGE_HE);

  const phone = parseIsraeliMobilePhone(parsed.data.phone);
  if (!phone) return jsonError(INVALID_PHONE_MESSAGE_HE);

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpCode.deleteMany({ where: { userId: user.id } });
  await prisma.otpCode.create({
    data: { userId: user.id, code, expiresAt },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { phone },
  });

  const devCode =
    process.env.NODE_ENV === "development" ? code : undefined;
  if (process.env.NODE_ENV === "development") {
    console.log(`[Linky OTP] ${phone}: ${code}`);
  }

  return jsonOk({
    message: "קוד אימות נשלח",
    devCode,
  });
}
