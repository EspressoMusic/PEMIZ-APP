import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  refreshSessionOnResponse,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth-session";

import {
  buildStudioGateToken,
  getStudioAccessPath,
  studioGateCookieOptions,
  STUDIO_GATE_COOKIE,
  verifyStudioGateToken,
} from "@/lib/studio-access";

const protectedPrefixes = [
  "/dashboard",
  "/verify-email",
  "/onboarding",
  "/pending-approval",
  "/trial-expired",
];

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

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { session, exp } = await verifySessionToken(token);
    let response = NextResponse.next();
    response = await refreshSessionOnResponse(response, session, exp);
    return response;
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
