"use client";

import { useEffect, useState } from "react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import {
  readCustomerCookieConsent,
  writeCustomerCookieConsent,
  type CustomerCookieConsentLevel,
} from "@/lib/customer-cookie-consent";

function copy(locale: CustomerLocale) {
  if (locale === "he") {
    return {
      title: "עוגיות בחנות זו",
      body: "אנחנו משתמשים בעוגיות הכרחיות כדי שהחנות תעבוד. אפשר לאשר גם עוגיות נוספות לשיפור החוויה.",
      acceptAll: "אשר את כל העוגיות",
      necessaryOnly: "רק הכרחי",
      privacy: "מדיניות פרטיות",
    };
  }
  return {
    title: "Cookies on this store",
    body: "We use necessary cookies so the store works. You can also allow additional cookies to improve your experience.",
    acceptAll: "Accept all cookies",
    necessaryOnly: "Necessary only",
    privacy: "Privacy Policy",
  };
}

export function CustomerCookieConsent({
  businessSlug,
  locale = "en",
}: {
  businessSlug: string;
  locale?: CustomerLocale;
}) {
  const [visible, setVisible] = useState(false);
  const labels = copy(locale);

  useEffect(() => {
    setVisible(readCustomerCookieConsent(businessSlug) === null);
  }, [businessSlug]);

  function choose(level: CustomerCookieConsentLevel) {
    writeCustomerCookieConsent(businessSlug, level);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <CookieConsentBanner
      title={labels.title}
      body={labels.body}
      acceptAll={labels.acceptAll}
      necessaryOnly={labels.necessaryOnly}
      privacyLabel={labels.privacy}
      onChoose={choose}
    />
  );
}
