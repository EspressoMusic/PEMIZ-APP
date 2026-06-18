"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import {
  readPlatformCookieConsent,
  shouldShowPlatformCookieConsent,
  writePlatformCookieConsent,
  type CustomerCookieConsentLevel,
} from "@/lib/customer-cookie-consent";

function labels(locale: "he" | "en") {
  if (locale === "he") {
    return {
      title: "עוגיות באתר Peymiz",
      body: "אנחנו משתמשים בעוגיות הכרחיות כדי שהאתר יעבוד (התחברות, העדפות). אפשר לאשר גם עוגיות נוספות לשיפור החוויה.",
      acceptAll: "אשר את כל העוגיות",
      necessaryOnly: "רק הכרחי",
      privacy: "מדיניות פרטיות",
    };
  }
  return {
    title: "Cookies on Peymiz",
    body: "We use necessary cookies so the site works (sign-in, preferences). You can also allow additional cookies to improve your experience.",
    acceptAll: "Accept all cookies",
    necessaryOnly: "Necessary only",
    privacy: "Privacy Policy",
  };
}

function readDocumentLocale(): "he" | "en" {
  if (typeof document === "undefined") return "he";
  const attr = document.documentElement.getAttribute("data-locale");
  if (attr === "en") return "en";
  if (document.documentElement.lang === "en") return "en";
  return "he";
}

export function SiteCookieConsent() {
  const pathname = usePathname() ?? "/";
  const [visible, setVisible] = useState(false);
  const [locale, setLocale] = useState<"he" | "en">("he");

  useEffect(() => {
    if (!shouldShowPlatformCookieConsent(pathname)) {
      setVisible(false);
      return;
    }
    setLocale(readDocumentLocale());
    setVisible(readPlatformCookieConsent() === null);
  }, [pathname]);

  function choose(level: CustomerCookieConsentLevel) {
    writePlatformCookieConsent(level);
    setVisible(false);
  }

  if (!visible) return null;

  const copy = labels(locale);

  return (
    <CookieConsentBanner
      variant="site"
      title={copy.title}
      body={copy.body}
      acceptAll={copy.acceptAll}
      necessaryOnly={copy.necessaryOnly}
      privacyLabel={copy.privacy}
      onChoose={choose}
    />
  );
}
