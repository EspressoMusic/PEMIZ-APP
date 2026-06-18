import { cookies } from "next/headers";
import {
  DASHBOARD_LOCALE_COOKIE,
  parseLocaleCookie,
} from "@/lib/dashboard-appearance-boot";
import type { AppLocale } from "@/lib/app-locale";

export function normalizePreferredLocale(
  value: string | null | undefined
): AppLocale {
  return value === "en" ? "en" : "he";
}

export async function readPreferredLocaleFromCookies(): Promise<AppLocale> {
  const cookieStore = await cookies();
  return (
    parseLocaleCookie(cookieStore.get(DASHBOARD_LOCALE_COOKIE)?.value) ?? "he"
  );
}
