"use client";

import { useEffect, useMemo } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui";
import type { CustomerLocale } from "@/lib/customer-preferences";

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
};

export function CustomerSellerNotice({
  open,
  message,
  locale,
  onClose,
}: {
  open: boolean;
  message: string;
  locale: CustomerLocale;
  onClose: () => void;
}) {
  const title = locale === "he" ? "הודעה מהמוכר" : "Message from the store";
  const closeLabel = locale === "he" ? "הבנתי" : "Got it";

  const confettiPieces = useMemo<ConfettiPiece[]>(() => {
    const colors = ["#e6d4b8", "#5c4a3e", "#43a047", "#c9a66b", "#7eb8ff", "#f4f0e8"];
    return Array.from({ length: 52 }, (_, id) => ({
      id,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1.3,
      color: colors[id % colors.length]!,
      size: 5 + Math.floor(Math.random() * 7),
    }));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || !message.trim()) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={closeLabel}
      />

      <div
        className="confetti-layer pointer-events-none absolute inset-0 overflow-hidden"
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

      <div className="customer-seller-notice-panel relative z-10 w-full max-w-md rounded-[24px] border p-5 shadow-[0_12px_40px_rgba(58,47,38,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <span className="customer-seller-notice-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
            <Bell className="h-6 w-6" strokeWidth={2} />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-bakery-muted transition hover:bg-bakery-primary/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2 className="mt-3 text-[18px] font-extrabold text-bakery-ink">{title}</h2>
        <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[1.5] text-bakery-ink">
          {message}
        </p>
        <Button
          type="button"
          variant="primary"
          className="customer-seller-notice-btn mt-4 w-full"
          onClick={onClose}
        >
          {closeLabel}
        </Button>
      </div>
    </div>
  );
}
