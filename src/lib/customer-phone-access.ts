import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/security/cookies";

export const CUSTOMER_PHONE_COOKIE = "linky_customer_phone";

const DEV_SESSION_FALLBACK =
  "linky-dev-secret-change-in-production-32chars-min";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return new TextEncoder().encode(secret);
  }
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode(DEV_SESSION_FALLBACK);
  }
  throw new Error("SESSION_SECRET must be at least 32 characters");
}

type CustomerPhonePayload = {
  businessId: string;
  phone: string;
};

export async function issueCustomerPhoneToken(
  businessId: string,
  phone: string
): Promise<string> {
  return new SignJWT({ businessId, phone, kind: "customer_phone" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function parseCustomerPhoneToken(
  token: string
): Promise<CustomerPhonePayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.kind !== "customer_phone") return null;
    const businessId = payload.businessId;
    const phone = payload.phone;
    if (typeof businessId !== "string" || typeof phone !== "string") return null;
    return { businessId, phone };
  } catch {
    return null;
  }
}

export async function grantCustomerPhoneAccess(
  businessId: string,
  phone: string
) {
  const token = await issueCustomerPhoneToken(businessId, phone);
  const cookieStore = await cookies();
  cookieStore.set(
    CUSTOMER_PHONE_COOKIE,
    token,
    sessionCookieOptions(60 * 60 * 24 * 7)
  );
}

export async function getGrantedCustomerPhone(
  businessId: string
): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_PHONE_COOKIE)?.value;
  if (!token) return null;
  const payload = await parseCustomerPhoneToken(token);
  if (!payload || payload.businessId !== businessId) return null;
  return payload.phone;
}

export function phoneVerificationRequiredResponse() {
  return NextResponse.json(
    {
      error: "נדרש אימות טלפון לפני צפייה בנתונים",
      code: "PHONE_VERIFICATION_REQUIRED",
    },
    { status: 403 }
  );
}

export async function requireCustomerPhoneAccess(
  businessId: string,
  requestedPhone: string
): Promise<NextResponse | null> {
  const granted = await getGrantedCustomerPhone(businessId);
  if (!granted || granted !== requestedPhone) {
    return phoneVerificationRequiredResponse();
  }
  return null;
}
