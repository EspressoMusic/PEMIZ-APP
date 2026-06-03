"use client";

import { useMemo } from "react";
import { Megaphone } from "lucide-react";
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
  expanded,
  onToggle,
  onDismiss,
  unread = false,
}: {
  message: string;
  labels: CustomerLabels;
  expanded: boolean;
  onToggle: () => void;
  onDismiss: () => void;
  unread?: boolean;
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
  }, [expanded, unread]);

  if (!message.trim()) return null;

  const showConfetti = expanded && unread;

  return (
    <div className="relative w-full">
      {showConfetti && (
        <div
          className="confetti-layer pointer-events-none fixed inset-0 z-[55] overflow-hidden"
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

      <div className="customer-seller-notice-panel border-b shadow-[0_4px_16px_rgba(58,47,38,0.1)]">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex w-full items-center gap-3 px-4 py-3 text-start transition hover:opacity-95"
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
            {!expanded && (
              <span className="mt-0.5 block truncate text-[13px] font-semibold text-bakery-ink/80">
                {message}
              </span>
            )}
          </span>
          {unread && (
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-bakery-error ring-2 ring-[#faf4e6]"
              aria-hidden
            />
          )}
        </button>

        {expanded && (
          <div className="border-t border-bakery-border/25 px-4 pb-4 pt-3">
            <p className="whitespace-pre-wrap text-[15px] leading-[1.5] text-bakery-ink">
              {message}
            </p>
            <Button
              type="button"
              variant="primary"
              className="customer-seller-notice-btn mt-3 w-full"
              onClick={onDismiss}
            >
              {labels.sellerNoticeGotIt}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
