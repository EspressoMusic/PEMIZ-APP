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
import type { CustomerLocale } from "@/lib/customer-preferences";
import {
  DASHBOARD_LOCALE_COOKIE,
  parseLocaleCookie,
} from "@/lib/dashboard-appearance-boot";
import { SITE_LOCALE } from "@/lib/site-locale";

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

/**
 * Vercel's edge network stamps `x-vercel-ip-country` on every request
 * (independent of the removed `NextRequest.geo` accessor). Falls back to
 * Accept-Language for local dev where that header isn't present.
 */
function detectLocaleFromRequest(request: NextRequest): CustomerLocale {
  const country = request.headers.get("x-vercel-ip-country");
  if (country) {
    return country.toUpperCase() === "IL" ? "he" : "en";
  }
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  return acceptLanguage.toLowerCase().startsWith("he") ? "he" : SITE_LOCALE;
}

/** First visit only — never overrides a locale the visitor already has/chose. */
function applyLocaleDetection(request: NextRequest, response: NextResponse) {
  if (parseLocaleCookie(request.cookies.get(DASHBOARD_LOCALE_COOKIE)?.value)) {
    return;
  }
  response.cookies.set(
    DASHBOARD_LOCALE_COOKIE,
    detectLocaleFromRequest(request),
    {
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
      sameSite: "lax",
    }
  );
}

function finish(request: NextRequest, response: NextResponse) {
  applyLocaleDetection(request, response);
  return response;
}

export async function proxy(request: NextRequest) {
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
      return finish(request, response);
    }

    const gateOpen = await hasStudioGate(request);
    if (
      !gateOpen &&
      (pathname === "/dev" ||
        pathname.startsWith("/dev/") ||
        pathname === "/master")
    ) {
      return finish(
        request,
        NextResponse.rewrite(new URL("/not-found", request.url))
      );
    }
  }

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!isProtected) return finish(request, NextResponse.next());

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return finish(
      request,
      NextResponse.redirect(new URL("/login", request.url))
    );
  }

  try {
    const { session, exp } = await verifySessionToken(token);
    let response = NextResponse.next();
    response = await refreshSessionOnResponse(response, session, exp);
    return finish(request, response);
  } catch {
    return finish(
      request,
      NextResponse.redirect(new URL("/login", request.url))
    );
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
