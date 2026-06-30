import { cache } from "react";
import { randomInt } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { withDbTimeout } from "@/lib/db-query-timeout";
import { sessionCookieOptions } from "@/lib/security/cookies";
import {
  SESSION_COOKIE_NAME,
  sessionMaxAgeSeconds,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/auth-session";
import { safeUserSelect, type SafeUser } from "@/lib/security/user-select";

export type { SessionPayload } from "@/lib/auth-session";
export {
  SESSION_COOKIE_NAME,
  refreshSessionOnResponse,
  getSessionSecret,
} from "@/lib/auth-session";

export async function createSession(payload: SessionPayload) {
  const maxAgeSeconds = sessionMaxAgeSeconds(payload);
  const token = await signSessionToken(payload, maxAgeSeconds);
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    sessionCookieOptions(maxAgeSeconds)
  );
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(0),
    maxAge: 0,
  });
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { session } = await verifySessionToken(token);
    return session;
  } catch {
    return null;
  }
});

export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const session = await getSession();
  if (!session) return null;
  try {
    const user = await withDbTimeout(
      prisma.user.findUnique({
        where: { id: session.userId },
        select: safeUserSelect,
      })
    );
    if (!user) return null;

    if (!user.business) {
      const business = await withDbTimeout(
        prisma.business.findUnique({ where: { ownerId: user.id } })
      );
      if (business) return { ...user, business };
    }

    return user;
  } catch {
    return null;
  }
});

export function generateOtp(): string {
  return String(randomInt(100_000, 1_000_000));
}
