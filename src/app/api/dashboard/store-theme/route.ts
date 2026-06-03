import { cookies } from "next/headers";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonOk } from "@/lib/api";
import {
  DASHBOARD_LOCALE_COOKIE,
  DASHBOARD_THEME_COOKIE,
} from "@/lib/dashboard-appearance-boot";
import { STORE_THEME_IDS } from "@/lib/store-themes";

const APPEARANCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

const schema = z.object({
  storeTheme: z.enum(STORE_THEME_IDS).optional(),
  storeLocale: z.enum(["he", "en"]).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const b = user.business;
  return jsonOk({
    storeTheme: b.storeTheme,
    storeLocale: b.storeLocale === "en" ? "en" : "he",
  });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user?.business) return jsonError("לא מורשה", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("נתונים לא תקינים");
  if (!parsed.data.storeTheme && !parsed.data.storeLocale) {
    return jsonError("אין נתונים לעדכון");
  }

  const updated = await prisma.business.update({
    where: { id: user.business.id },
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
    cookieStore.set(DASHBOARD_THEME_COOKIE, parsed.data.storeTheme, {
      path: "/",
      maxAge: APPEARANCE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  }
  if (parsed.data.storeLocale != null) {
    cookieStore.set(DASHBOARD_LOCALE_COOKIE, parsed.data.storeLocale, {
      path: "/",
      maxAge: APPEARANCE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  }

  return jsonOk({
    storeTheme: updated.storeTheme,
    storeLocale: updated.storeLocale === "en" ? "en" : "he",
  });
}
