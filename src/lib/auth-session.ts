import { SignJWT, jwtVerify } from "jose";
import type { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/security/cookies";
import {
  ADMIN_SUPPORT_SESSION_MAX_AGE_SECONDS,
  SELLER_SESSION_MAX_AGE_SECONDS,
  sessionJwtExpiryFromSeconds,
  shouldSlideRefreshSession,
} from "@/lib/session-config";
import type { Role } from "@/lib/types";

export const SESSION_COOKIE_NAME = "linky_session";

export type SessionPayload = {
  userId: string;
  email: string;
  role: Role;
  adminSupport?: boolean;
};

export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export function sessionMaxAgeSeconds(payload: SessionPayload): number {
  return payload.adminSupport
    ? ADMIN_SUPPORT_SESSION_MAX_AGE_SECONDS
    : SELLER_SESSION_MAX_AGE_SECONDS;
}

export async function signSessionToken(
  payload: SessionPayload,
  maxAgeSeconds = sessionMaxAgeSeconds(payload)
) {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    adminSupport: payload.adminSupport === true,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(sessionJwtExpiryFromSeconds(maxAgeSeconds))
    .sign(getSessionSecret());
}

export function applySessionCookie(
  response: NextResponse,
  token: string,
  maxAgeSeconds: number
) {
  response.cookies.set(
    SESSION_COOKIE_NAME,
    token,
    sessionCookieOptions(maxAgeSeconds)
  );
}

export async function refreshSessionOnResponse(
  response: NextResponse,
  payload: SessionPayload,
  tokenExpUnix?: number
) {
  if (!shouldSlideRefreshSession(tokenExpUnix)) return response;
  const maxAgeSeconds = sessionMaxAgeSeconds(payload);
  const token = await signSessionToken(payload, maxAgeSeconds);
  applySessionCookie(response, token, maxAgeSeconds);
  return response;
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSessionSecret());
  return {
    session: {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as Role,
      adminSupport: payload.adminSupport === true,
    } satisfies SessionPayload,
    exp: payload.exp,
  };
}

export function parseSessionPayload(raw: unknown): SessionPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<SessionPayload>;
  if (
    typeof row.userId !== "string" ||
    typeof row.email !== "string" ||
    typeof row.role !== "string"
  ) {
    return null;
  }
  return {
    userId: row.userId,
    email: row.email,
    role: row.role as Role,
    adminSupport: row.adminSupport === true,
  };
}
