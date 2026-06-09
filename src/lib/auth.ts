import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { withDbTimeout } from "@/lib/db-query-timeout";
import { sessionCookieOptions } from "@/lib/security/cookies";
import { safeUserSelect, type SafeUser } from "@/lib/security/user-select";
import type { Role } from "@/lib/types";

const COOKIE_NAME = "linky_session";

export type SessionPayload = {
  userId: string;
  email: string;
  role: Role;
  /** Set when platform admin impersonates a seller to manage their store. */
  adminSupport?: boolean;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, sessionCookieOptions(60 * 60 * 24 * 7));
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as Role,
      adminSupport: payload.adminSupport === true,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session) return null;
  try {
    return await withDbTimeout(
      prisma.user.findUnique({
        where: { id: session.userId },
        select: safeUserSelect,
      })
    );
  } catch {
    return null;
  }
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
