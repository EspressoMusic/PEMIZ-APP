import type { CustomerLocale } from "@/lib/customer-preferences";

/** Site-wide UI language — English only for now. */
export const SITE_LOCALE: CustomerLocale = "en";

export function resolveSiteLocale(
  _value?: string | null | undefined
): CustomerLocale {
  return SITE_LOCALE;
}
