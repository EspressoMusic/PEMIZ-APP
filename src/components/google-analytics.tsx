"use client";

import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

const GA_MEASUREMENT_ID = "G-62HRZK6NGW";

/**
 * Loads gtag.js for every visitor. GA4 aggregates traffic without storing
 * raw IPs or other personal identifiers, so this runs unconditionally
 * rather than waiting on the cookie-consent banner (most visits land
 * directly on /b/ store pages, which never show that banner).
 */
export function GoogleAnalytics() {
  return <NextGoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
