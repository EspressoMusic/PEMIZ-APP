"use client";

import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui";
import type { CustomerLocale } from "@/lib/customer-preferences";

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
  if (!open || !message.trim()) return null;

  const title = locale === "he" ? "הודעה מהמוכר" : "Message from the store";
  const closeLabel = locale === "he" ? "הבנתי" : "Got it";

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
      <div className="relative w-full max-w-md rounded-[24px] border border-bakery-border/30 bg-bakery-square p-5 shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-bakery-primary/15 text-bakery-primary">
            <Bell className="h-6 w-6" strokeWidth={2} />
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-bakery-muted hover:bg-bakery-card/80"
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
          variant="square"
          className="mt-4 w-full"
          onClick={onClose}
        >
          {closeLabel}
        </Button>
      </div>
    </div>
  );
}
