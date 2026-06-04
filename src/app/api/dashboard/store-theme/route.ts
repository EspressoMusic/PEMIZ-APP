import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import { requireBusinessOwner } from "@/lib/dashboard-auth";
import {
  DASHBOARD_LOCALE_COOKIE,
  DASHBOARD_THEME_COOKIE,
} from "@/lib/dashboard-appearance-boot";
import { preferenceCookieOptions } from "@/lib/security/cookies";
import { storeThemePatchSchema, zodFirstError } from "@/lib/validation/schemas";

const APPEARANCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export async function GET() {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const b = ctx.user.business;
  return jsonOk({
    storeTheme: b.storeTheme,
    storeLocale: b.storeLocale === "en" ? "en" : "he",
  });
}

export async function PATCH(req: Request) {
  const ctx = await requireBusinessOwner();
  if (!ctx.ok) return ctx.response;

  const body = await req.json().catch(() => null);
  const parsed = storeThemePatchSchema.safeParse(body);
  if (!parsed.success) return jsonError(zodFirstError(parsed));
  if (!parsed.data.storeTheme && !parsed.data.storeLocale) {
    return jsonError("אין נתונים לעדכון");
  }

  const updated = await prisma.business.update({
    where: { id: ctx.user.business.id },
    data: {
      ...(parsed.data.storeTheme != null
        ? { storeTheme: parsed.data.storeTheme }
        : {}),
      ...(parsed.data.storeLocale != null
        ? { storeLocale: parsed.data.storeLocale }
        : {}),
    },
    select: { storeTheme: true, storeLocale: true },
  });

  const cookieStore = await cookies();
  if (parsed.data.storeTheme != null) {
    cookieStore.set(
      DASHBOARD_THEME_COOKIE,
      parsed.data.storeTheme,
      preferenceCookieOptions(APPEARANCE_COOKIE_MAX_AGE)
    );
  }
  if (parsed.data.storeLocale != null) {
    cookieStore.set(
      DASHBOARD_LOCALE_COOKIE,
      parsed.data.storeLocale,
      preferenceCookieOptions(APPEARANCE_COOKIE_MAX_AGE)
    );
  }

  return jsonOk({
    storeTheme: updated.storeTheme,
    storeLocale: updated.storeLocale === "en" ? "en" : "he",
  });
}
