"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  platformAllowsAnalyticsCookies,
} from "@/lib/customer-cookie-consent";

const GA_MEASUREMENT_ID = "G-62HRZK6NGW";

/** Only loads gtag.js once the visitor has accepted analytics cookies in SiteCookieConsent. */
export function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function sync() {
      setAllowed(platformAllowsAnalyticsCookies());
    }
    sync();
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, sync);
  }, []);

  if (!allowed) return null;

  return <NextGoogleAnalytics gaId={GA_MEASUREMENT_ID} />;
}
