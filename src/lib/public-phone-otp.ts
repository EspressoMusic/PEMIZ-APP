import { prisma } from "@/lib/prisma";
import { generateOtp } from "@/lib/auth";
import { OTP_EXPIRY_MINUTES } from "@/lib/constants";
import { grantCustomerPhoneAccess } from "@/lib/customer-phone-access";

export async function sendPublicPhoneOtp(businessId: string, phone: string) {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.publicPhoneOtp.deleteMany({ where: { businessId, phone } });
  await prisma.publicPhoneOtp.create({
    data: { businessId, phone, code, expiresAt },
  });

  if (process.env.NODE_ENV === "development") {
    console.log(`[Linky customer OTP] business=${businessId} phone=${phone} code=${code}`);
  }

  return {
    devCode: process.env.NODE_ENV === "development" ? code : undefined,
  };
}

export async function verifyPublicPhoneOtp(
  businessId: string,
  phone: string,
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const otp = await prisma.publicPhoneOtp.findFirst({
    where: { businessId, phone },
    orderBy: { createdAt: "desc" },
  });

  if (!otp || otp.code !== code) {
    return { ok: false, error: "קוד שגוי" };
  }
  if (otp.expiresAt < new Date()) {
    return { ok: false, error: "הקוד פג תוקף" };
  }

  await prisma.publicPhoneOtp.deleteMany({ where: { businessId, phone } });
  await grantCustomerPhoneAccess(businessId, phone);
  return { ok: true };
}
