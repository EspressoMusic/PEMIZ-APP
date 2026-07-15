import type { CustomerLocale } from "@/lib/customer-preferences";

/** Default UI language when no preference is stored. */
export const SITE_LOCALE: CustomerLocale = "en";

export function resolveSiteLocale(
  value?: string | null | undefined
): CustomerLocale {
  if (value === "en" || value === "he") return value;
  return SITE_LOCALE;
}