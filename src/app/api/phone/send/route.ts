import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, generateOtp } from "@/lib/auth";
import { OTP_EXPIRY_MINUTES } from "@/lib/constants";
import { jsonError, jsonOk } from "@/lib/api";

const schema = z.object({
  phone: z.string().min(9).max(20),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("לא מחובר", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("מספר טלפון לא תקין");

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpCode.deleteMany({ where: { userId: user.id } });
  await prisma.otpCode.create({
    data: { userId: user.id, code, expiresAt },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { phone: parsed.data.phone.replace(/\s/g, "") },
  });

  const devCode =
    process.env.NODE_ENV === "development" ? code : undefined;
  if (process.env.NODE_ENV === "development") {
    console.log(`[Linky OTP] ${parsed.data.phone}: ${code}`);
  }

  return jsonOk({
    message: "קוד אימות נשלח",
    devCode,
  });
}
