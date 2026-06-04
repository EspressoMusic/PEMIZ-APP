import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import {
  buildStudioGateToken,
  getStudioAccessPath,
  studioGateCookieOptions,
  STUDIO_GATE_COOKIE,
  verifyStudioGateToken,
} from "@/lib/studio-access";

const SESSION_COOKIE = "linky_session";

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

function hasStudioGate(request: NextRequest) {
  const token = request.cookies.get(STUDIO_GATE_COOKIE)?.value;
  return verifyStudioGateToken(token);
}

async function attachStudioGate(response: NextResponse) {
  const token = await buildStudioGateToken();
  response.cookies.set(studioGateCookieOptions(token));
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const studioPath = getStudioAccessPath();
  const isProduction = process.env.NODE_ENV === "production";

  if (studioPath && isProduction) {
    const prefix = `/${studioPath}`;
    const isStudioEntry =
      pathname === prefix || pathname.startsWith(`${prefix}/`);

    if (isStudioEntry) {
      const sub =
        pathname === prefix ? "" : pathname.slice(prefix.length);
      const isConsole = sub === "/console" || sub.startsWith("/console/");
      const target = isConsole
        ? "/master"
        : sub
          ? `/dev${sub}`
          : "/dev";
      let response = NextResponse.redirect(new URL(target, request.url));
      response = await attachStudioGate(response);
      return response;
    }

    const gateOpen = await hasStudioGate(request);
    if (
      !gateOpen &&
      (pathname === "/dev" ||
        pathname.startsWith("/dev/") ||
        pathname === "/master")
    ) {
      return NextResponse.rewrite(new URL("/not-found", request.url));
    }
  }

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
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
    "/dev",
    "/dev/:path*",
    "/master",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
