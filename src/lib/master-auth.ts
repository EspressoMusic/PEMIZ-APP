import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { sessionCookieOptions } from "@/lib/security/cookies";

export const MASTER_COOKIE = "linky_master";

/** Constant-time compare — Edge-safe (no Node `crypto`). */
function timingSafeEqualUtf8(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const bufA = enc.encode(a.trim());
  const bufB = enc.encode(b.trim());
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i]! ^ bufB[i]!;
  }
  return diff === 0;
}

const DEV_SESSION_FALLBACK =
  "linky-dev-secret-change-in-production-32chars-min";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) {
    return new TextEncoder().encode(secret);
  }
  // Only allow the well-known fallback on a true local machine. Any real
  // deployment (NODE_ENV=production OR running on Vercel) must provide a
  // real secret, even if NODE_ENV was misconfigured.
  const isDeployed =
    process.env.NODE_ENV === "production" || !!process.env.VERCEL_ENV;
  if (!isDeployed) {
    return new TextEncoder().encode(DEV_SESSION_FALLBACK);
  }
  throw new Error("SESSION_SECRET must be at least 32 characters");
}

function normalizeEnvSecret(raw: string | undefined): string | null {
  if (!raw) return null;
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }
  return key.length >= 2 ? key : null;
}

export function getMasterKeyFromEnv(): string | null {
  return normalizeEnvSecret(process.env.MASTER_KEY);
}

export function verifyMasterKey(input: string): boolean {
  const expected = getMasterKeyFromEnv();
  if (!expected) return false;
  return timingSafeEqualUtf8(input, expected);
}

export async function buildMasterSessionToken(): Promise<string> {
  return new SignJWT({ master: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecret());
}

export function masterSessionCookieOptions(token: string) {
  return {
    name: MASTER_COOKIE,
    value: token,
    ...sessionCookieOptions(60 * 60 * 24),
  };
}

export async function createMasterSession() {
  const token = await buildMasterSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(MASTER_COOKIE, token, masterSessionCookieOptions(token));
}

export async function destroyMasterSession() {
  const cookieStore = await cookies();
  cookieStore.delete(MASTER_COOKIE);
}

export async function isMasterSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(MASTER_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.master === true;
  } catch {
    return false;
  }
}
