"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardActionSheet({
  open,
  onClose,
  title,
  ariaLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const { labels } = useAppLocale();
  const closeLabel = labels.close;
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title ?? closeLabel}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <div className="relative flex max-h-[min(88vh,640px)] w-full max-w-md flex-col overflow-hidden rounded-[24px] border border-bakery-border/30 bg-bakery-square shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-bakery-border/25 px-4 py-3">
          {title ? (
            <h2 className="text-[18px] font-extrabold text-bakery-ink">{title}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 text-bakery-muted hover:bg-bakery-card/80"
            aria-label={closeLabel}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
