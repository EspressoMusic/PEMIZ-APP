import { cookies } from "next/headers";
import { normalizeAppLocale, type AppLocale } from "@/lib/app-locale";
import {
  DASHBOARD_LOCALE_COOKIE,
  parseLocaleCookie,
} from "@/lib/dashboard-appearance-boot";
import { SITE_LOCALE } from "@/lib/site-locale";

export function normalizePreferredLocale(
  value: string | null | undefined
): AppLocale {
  return normalizeAppLocale(value);
}

export async function readPreferredLocaleFromCookies(): Promise<AppLocale> {
  const cookieStore = await cookies();
  return (
    parseLocaleCookie(cookieStore.get(DASHBOARD_LOCALE_COOKIE)?.value) ??
    SITE_LOCALE
  );
}
