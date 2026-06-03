"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import {
  customerThemeClass,
  type StoreThemeId,
} from "@/lib/store-themes";

/** Centered dialog — not a bottom sheet */
export function CustomerCenterModal({
  open,
  onClose,
  title,
  locale,
  children,
  ariaLabel,
  header,
  storeTheme = "calm",
  bodyClassName = "",
  panelClassName = "",
}: {
  open: boolean;
  onClose: () => void;
  locale: CustomerLocale;
  children: ReactNode;
  title?: string;
  ariaLabel?: string;
  /** Custom header row (e.g. FAQ with close only) */
  header?: ReactNode;
  /** Matches storefront theme so portal inherits cream / light / dark tokens */
  storeTheme?: StoreThemeId;
  bodyClassName?: string;
  panelClassName?: string;
}) {
  const themeClass = customerThemeClass(storeTheme);
  const closeLabel = locale === "he" ? "סגור" : "Close";

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
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
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
      <div
        className={`customer-store-root ${themeClass} customer-center-modal__panel relative flex max-h-[min(88dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-[24px] border border-bakery-border/30 shadow-[0_12px_40px_rgba(58,47,38,0.2)] ${panelClassName}`}
      >
        {header ??
          (title ? (
            <div className="customer-center-modal__header flex shrink-0 items-center justify-between gap-2 border-b border-bakery-border/25 px-4 py-3">
              <h2 className="text-[18px] font-extrabold text-bakery-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full p-1.5 text-bakery-muted transition hover:bg-bakery-card/80"
                aria-label={closeLabel}
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          ) : null)}
        <div
          className={`customer-center-modal__body min-h-0 flex-1 overscroll-contain ${bodyClassName || "overflow-y-auto"}`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
