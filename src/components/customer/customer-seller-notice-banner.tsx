"use client";

import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui";
import type { CustomerLabels } from "./customer-labels";

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
};

export function CustomerSellerNoticeBanner({
  message,
  labels,
  open,
  onOpen,
  onClose,
  onDismiss,
  unread = false,
  rentalMode = false,
}: {
  message: string;
  labels: CustomerLabels;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDismiss: () => void;
  unread?: boolean;
  /** חנות השכרה — רקע בהיר יותר; פגישות/מוצרים — רק מסגרת */
  rentalMode?: boolean;
}) {
  const confettiPieces = useMemo<ConfettiPiece[]>(() => {
    const colors = ["#e6d4b8", "#5c4a3e", "#43a047", "#c9a66b", "#7eb8ff", "#f4f0e8"];
    return Array.from({ length: 40 }, (_, id) => ({
      id,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      duration: 2 + Math.random() * 1.2,
      color: colors[id % colors.length]!,
      size: 5 + Math.floor(Math.random() * 6),
    }));
  }, [open, unread]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!message.trim()) return null;

  const showConfetti = open && unread;

  return (
    <div className="relative w-full">
      {showConfetti && (
        <div
          className="confetti-layer pointer-events-none fixed inset-0 z-[85] overflow-hidden"
          aria-hidden
        >
          {confettiPieces.map((p) => (
            <span
              key={p.id}
              className="confetti-piece"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size * 1.35,
                backgroundColor: p.color,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className={`customer-seller-notice-panel customer-seller-notice-banner-strip shadow-[0_4px_16px_rgba(58,47,38,0.08)] ${
          rentalMode
            ? "customer-seller-notice-banner-strip--rental"
            : "customer-seller-notice-banner-strip--framed"
        }`}
      >
        <button
          type="button"
          onClick={onOpen}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-start transition hover:bg-bakery-card/40 active:scale-[0.99]"
        >
          <span className="customer-seller-notice-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <span className="inline-flex rtl:scale-x-[-1]">
              <Megaphone
                className="customer-seller-notice-megaphone h-5 w-5"
                strokeWidth={2}
                aria-hidden
              />
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="customer-seller-notice-title block text-[15px] font-extrabold">
              {labels.sellerNoticeTitle}
            </span>
            <span className="mt-0.5 block truncate text-[13px] font-semibold text-bakery-ink/80">
              {message}
            </span>
          </span>
        </button>
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[90] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-label={labels.sellerNoticeTitle}
            >
              <button
                type="button"
                className="absolute inset-0 bg-bakery-ink/60 backdrop-blur-[3px]"
                onClick={onClose}
                aria-label={labels.close}
              />
              <div className="customer-seller-notice-panel relative flex max-h-[min(80dvh,520px)] w-full max-w-md flex-col overflow-hidden rounded-[24px] border-[3px] border-[#5C4A3E]/22 bg-[#E6D5B8] shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
                <div className="relative flex min-h-[52px] shrink-0 items-center justify-center px-12 py-3">
                  <h2 className="w-full text-center text-[18px] font-extrabold text-bakery-ink">
                    {labels.sellerNoticeTitle}
                  </h2>
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-bakery-muted transition hover:bg-bakery-card/80"
                    aria-label={labels.close}
                  >
                    <X className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-1">
                  <div className="rounded-[16px] border-[3px] border-[#5C4A3E]/18 bg-bakery-cream-light px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
                    <p className="whitespace-pre-wrap text-center text-[16px] font-semibold leading-[1.55] text-bakery-ink">
                      {message}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 px-4 py-4">
                  <Button
                    type="button"
                    variant="primary"
                    className="customer-seller-notice-btn w-full min-h-[48px] text-[15px] font-extrabold"
                    onClick={onDismiss}
                  >
                    {labels.sellerNoticeGotIt}
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
