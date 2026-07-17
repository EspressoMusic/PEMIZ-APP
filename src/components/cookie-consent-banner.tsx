"use client";

import Link from "next/link";
import type {
  CookieConsentVariant,
  CustomerCookieConsentLevel,
} from "@/lib/customer-cookie-consent";

export function CookieConsentBanner({
  title,
  body,
  acceptAll,
  necessaryOnly,
  privacyLabel,
  onChoose,
  variant = "bakery",
}: {
  title: string;
  body: string;
  acceptAll: string;
  necessaryOnly: string;
  privacyLabel: string;
  onChoose: (level: CustomerCookieConsentLevel) => void;
  /** Purple Peymiz marketing style vs warm bakery (app shell, customer stores). */
  variant?: CookieConsentVariant;
}) {
  const isSite = variant === "site";

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[120] flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={
          isSite
            ? "site-cookie-consent pointer-events-auto w-full max-w-lg rounded-[22px] p-4 backdrop-blur-md"
            : "pointer-events-auto w-full max-w-lg rounded-[22px] border border-bakery-border/40 bg-bakery-cream-light/95 p-4 shadow-[0_12px_40px_rgba(58,47,38,0.18)] backdrop-blur-sm"
        }
      >
        <p
          className={
            isSite
              ? "site-cookie-consent__title text-[15px] font-extrabold"
              : "text-[15px] font-extrabold text-bakery-ink"
          }
        >
          {title}
        </p>
        <p
          className={
            isSite
              ? "site-cookie-consent__body mt-1.5 text-[13px] font-semibold leading-snug"
              : "mt-1.5 text-[13px] font-semibold leading-snug text-bakery-muted"
          }
        >
          {body}{" "}
          <Link
            href="/privacy"
            className={
              isSite
                ? "site-cookie-consent__link font-bold underline-offset-2 hover:underline"
                : "font-bold text-bakery-primary underline-offset-2 hover:underline"
            }
          >
            {privacyLabel}
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className={
              isSite
                ? "site-cookie-consent__btn site-cookie-consent__btn--primary min-h-[42px] flex-1 rounded-full px-4 text-[14px] font-extrabold"
                : "bakery-cta-3d bakery-cta-3d--primary min-h-[42px] flex-1 rounded-full px-4 text-[14px] font-extrabold"
            }
            onClick={() => onChoose("all")}
          >
            {acceptAll}
          </button>
          <button
            type="button"
            className={
              isSite
                ? "site-cookie-consent__btn site-cookie-consent__btn--ghost min-h-[42px] flex-1 rounded-full border px-4 text-[14px] font-extrabold"
                : "bakery-cta-3d bakery-cta-3d--secondary min-h-[42px] flex-1 rounded-full border-2 px-4 text-[14px] font-extrabold"
            }
            onClick={() => onChoose("necessary")}
          >
            {necessaryOnly}
          </button>
        </div>
      </div>
    </div>
  );
}
