export type CustomerCookieConsentLevel = "all" | "necessary";
export type CookieConsentVariant = "bakery" | "site";

const STORAGE_PREFIX = "linky-cookie-consent:";
export const PLATFORM_COOKIE_CONSENT_SCOPE = "platform";

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

export function readPlatformCookieConsent(): CustomerCookieConsentLevel | null {
  return readCustomerCookieConsent(PLATFORM_COOKIE_CONSENT_SCOPE);
}

export function writePlatformCookieConsent(level: CustomerCookieConsentLevel) {
  writeCustomerCookieConsent(PLATFORM_COOKIE_CONSENT_SCOPE, level);
}

export function platformAllowsAnalyticsCookies(): boolean {
  return readPlatformCookieConsent() === "all";
}

export function customerAllowsAnalyticsCookies(
  businessSlug: string
): boolean {
  return readCustomerCookieConsent(businessSlug) === "all";
}

/** Site-wide banner: marketing, auth, legal — not dashboard, dev, or customer stores. */
export function shouldShowPlatformCookieConsent(pathname: string): boolean {
  if (!pathname || pathname.startsWith("/b/")) return false;
  if (pathname.startsWith("/dashboard")) return false;
  if (pathname.startsWith("/dev")) return false;
  if (pathname.startsWith("/master")) return false;
  return true;
}

/** Routes that leave the purple marketing site for the warm app shell. */
const BAKERY_SHELL_ROUTES = [
  "/app",
  "/seller",
  "/login",
  "/signup",
  "/onboarding",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/trial-expired",
  "/pending-approval",
  "/paddle-checkout",
  "/preview",
];

/** Match the banner to the surface behind it: warm on the app, purple on marketing. */
export function platformCookieConsentVariant(
  pathname: string
): CookieConsentVariant {
  const onAppShell = BAKERY_SHELL_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  return onAppShell ? "bakery" : "site";
}
