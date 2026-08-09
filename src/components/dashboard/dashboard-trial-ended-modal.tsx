"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { buildWhatsAppChatUrl } from "@/lib/phone";

const TRIAL_WHATSAPP_PHONE = "0586122187";

/**
 * Pops up immediately (no banner step) the moment the trial-expired screen
 * mounts — the seller can't miss it the way an unread-message banner could
 * be scrolled past. Starts closed and opens in an effect (not `useState(true)`)
 * so the first client render still matches the server-rendered `null` —
 * matching this exact `typeof document` branch synchronously would otherwise
 * always mismatch, since `document` only exists on the client.
 */
export function DashboardTrialEndedModal({
  message,
  businessName,
}: {
  message: string;
  businessName?: string;
}) {
  const { labels, locale } = useAppLocale();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  const whatsAppUrl =
    buildWhatsAppChatUrl(
      TRIAL_WHATSAPP_PHONE,
      locale === "he"
        ? `שלום, תקופת הניסיון של החנות "${businessName ?? ""}" הסתיימה ואני רוצה לסדר תשלום.`
        : `Hi, the trial for "${businessName ?? ""}" has ended and I'd like to arrange payment.`
    ) ?? `https://wa.me/972586122187`;

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={labels.trialExpiredTitle}
    >
      <div className="absolute inset-0 bg-bakery-ink/55 backdrop-blur-[2px]" />
      <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-[24px] border border-bakery-border/40 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-mid shadow-[var(--shadow-bakery-panel)]">
        <div className="px-6 pb-2 pt-6 text-center">
          <h2 className="text-[18px] font-extrabold text-bakery-ink">
            {labels.trialExpiredTitle}
          </h2>
        </div>
        <div className="px-5 pb-2">
          <div className="rounded-[16px] border border-bakery-border/30 bg-bakery-card/80 px-4 py-4">
            <p className="whitespace-pre-wrap text-center text-[15px] font-semibold leading-[1.55] text-bakery-ink">
              {message}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 px-5 py-4">
          <a
            href={whatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="bakery-cta-3d bakery-cta-3d--primary flex w-full min-h-[48px] items-center justify-center !max-w-none !rounded-full text-[15px] font-extrabold"
          >
            {labels.trialExpiredContactWhatsApp}
          </a>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="min-h-[40px] text-[14px] font-bold text-bakery-muted transition hover:text-bakery-ink"
          >
            {labels.trialExpiredCloseModal}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
