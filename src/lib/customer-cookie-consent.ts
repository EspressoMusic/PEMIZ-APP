export type CustomerCookieConsentLevel = "all" | "necessary";

const STORAGE_PREFIX = "linky-cookie-consent:";

export function customerCookieConsentKey(businessSlug: string): string {
  return `${STORAGE_PREFIX}${businessSlug.toLowerCase()}`;
}

export function readCustomerCookieConsent(
  businessSlug: string
): CustomerCookieConsentLevel | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(customerCookieConsentKey(businessSlug));
  return raw === "all" || raw === "necessary" ? raw : null;
}

export function writeCustomerCookieConsent(
  businessSlug: string,
  level: CustomerCookieConsentLevel
) {
  if (typeof window === "undefined") return;
  localStorage.setItem(customerCookieConsentKey(businessSlug), level);
}

export function customerAllowsAnalyticsCookies(
  businessSlug: string
): boolean {
  return readCustomerCookieConsent(businessSlug) === "all";
}
