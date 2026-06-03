import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "linky_session";

const protectedPrefixes = [
  "/dashboard",
  "/verify-email",
  "/onboarding",
  "/pending-approval",
];

function getSecret() {
  return new TextEncoder().encode(
    process.env.SESSION_SECRET ?? "linky-dev-secret-change-in-production-32chars-min"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/verify-email",
    "/onboarding",
    "/pending-approval",
  ],
};
