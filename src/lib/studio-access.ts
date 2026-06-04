import { SignJWT, jwtVerify } from "jose";

export const STUDIO_GATE_COOKIE = "linky_studio_gate";

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

/** Opaque URL segment — set STUDIO_ACCESS_PATH in .env (no leading slash). */
export function getStudioAccessPath(): string | null {
  const raw = process.env.STUDIO_ACCESS_PATH?.trim();
  if (!raw) return null;
  const path = raw.replace(/^\/+|\/+$/g, "");
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{7,63}$/.test(path)) return null;
  return path;
}

export function studioEntryPath(): string {
  const segment = getStudioAccessPath();
  return segment ? `/${segment}` : "";
}

export function studioConsolePath(): string {
  const base = studioEntryPath();
  return base ? `${base}/console` : "";
}

export async function buildStudioGateToken(): Promise<string> {
  return new SignJWT({ studio: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyStudioGateToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.studio === true;
  } catch {
    return false;
  }
}

export function studioGateCookieOptions(token: string) {
  return {
    name: STUDIO_GATE_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
