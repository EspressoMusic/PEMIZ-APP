import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/security/cookies";

export const CUSTOMER_GOOGLE_COOKIE = "linky_customer_google";

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

type CustomerGooglePayload = {
  businessId: string;
  email: string;
};

export async function issueCustomerGoogleToken(
  businessId: string,
  email: string
): Promise<string> {
  return new SignJWT({
    businessId,
    email: email.trim().toLowerCase(),
    kind: "customer_google",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function parseCustomerGoogleToken(
  token: string
): Promise<CustomerGooglePayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.kind !== "customer_google") return null;
    const businessId = payload.businessId;
    const email = payload.email;
    if (typeof businessId !== "string" || typeof email !== "string") return null;
    return { businessId, email };
  } catch {
    return null;
  }
}

export async function grantCustomerGoogleAccess(
  businessId: string,
  email: string
) {
  const token = await issueCustomerGoogleToken(businessId, email);
  const cookieStore = await cookies();
  cookieStore.set(
    CUSTOMER_GOOGLE_COOKIE,
    token,
    sessionCookieOptions(60 * 60 * 24 * 30)
  );
}

export async function clearCustomerGoogleAccess() {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_GOOGLE_COOKIE, "", {
    ...sessionCookieOptions(0),
    maxAge: 0,
  });
}

export async function getGrantedCustomerGoogleEmail(
  businessId: string
): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_GOOGLE_COOKIE)?.value;
  if (!token) return null;
  const payload = await parseCustomerGoogleToken(token);
  if (!payload || payload.businessId !== businessId) return null;
  return payload.email;
}

export function googleSignInRequiredResponse() {
  return NextResponse.json(
    {
      error: "נדרשת התחברות עם Google לצפייה בהיסטוריה",
      code: "GOOGLE_SIGN_IN_REQUIRED",
    },
    { status: 403 }
  );
}

export async function requireCustomerGoogleAccess(
  businessId: string
): Promise<{ email: string } | NextResponse> {
  const email = await getGrantedCustomerGoogleEmail(businessId);
  if (!email) return googleSignInRequiredResponse();
  return { email };
}
