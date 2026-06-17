"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CustomerLocale } from "@/lib/customer-preferences";
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
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="true"
      aria-label={labels.title}
    >
      <div className="pointer-events-auto w-full max-w-lg rounded-[22px] border border-bakery-border/40 bg-bakery-cream-light/95 p-4 shadow-[0_12px_40px_rgba(58,47,38,0.18)] backdrop-blur-sm">
        <p className="text-[15px] font-extrabold text-bakery-ink">{labels.title}</p>
        <p className="mt-1.5 text-[13px] font-semibold leading-snug text-bakery-muted">
          {labels.body}{" "}
          <Link
            href="/privacy"
            className="font-bold text-bakery-primary underline-offset-2 hover:underline"
          >
            {labels.privacy}
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="bakery-cta-3d bakery-cta-3d--primary min-h-[42px] flex-1 rounded-full px-4 text-[14px] font-extrabold"
            onClick={() => choose("all")}
          >
            {labels.acceptAll}
          </button>
          <button
            type="button"
            className="bakery-cta-3d bakery-cta-3d--secondary min-h-[42px] flex-1 rounded-full border-2 px-4 text-[14px] font-extrabold"
            onClick={() => choose("necessary")}
          >
            {labels.necessaryOnly}
          </button>
        </div>
      </div>
    </div>
  );
}
