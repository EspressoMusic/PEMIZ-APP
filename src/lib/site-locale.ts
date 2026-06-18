import type { CustomerLocale } from "@/lib/customer-preferences";

/** Default UI language when no preference is stored. */
export const SITE_LOCALE: CustomerLocale = "he";

export function resolveSiteLocale(
  value?: string | null | undefined
): CustomerLocale {
  if (value === "en") return "en";
  return SITE_LOCALE;
}