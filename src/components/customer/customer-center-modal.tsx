"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import {
  customerThemeClass,
  type StoreThemeId,
} from "@/lib/store-themes";

/** Modal top bar: centered title, close on the side, optional leading control (back). */
export function CustomerModalHeaderBar({
  title,
  onClose,
  closeLabel,
  leading,
}: {
  title?: string;
  onClose: () => void;
  closeLabel: string;
  leading?: ReactNode;
}) {
  return (
    <div className="customer-center-modal__header relative flex shrink-0 min-h-[52px] items-center justify-center border-b border-bakery-border/25 px-12 py-3">
      {leading ? (
        <div className="absolute start-2 top-1/2 flex -translate-y-1/2 items-center">
          {leading}
        </div>
      ) : null}
      {title ? (
        <h2 className="w-full text-center text-[18px] font-extrabold leading-tight text-bakery-ink">
          {title}
        </h2>
      ) : null}
      <button
        type="button"
        onClick={onClose}
        className="absolute end-2 top-1/2 -translate-y-1/2 shrink-0 rounded-full p-1.5 text-bakery-muted transition hover:bg-bakery-card/80"
        aria-label={closeLabel}
      >
        <X className="h-5 w-5" strokeWidth={2} />
      </button>
    </div>
  );
}

/** Centered dialog — not a bottom sheet */
export function CustomerCenterModal({
  open,
  onClose,
  title,
  locale,
  children,
  ariaLabel,
  header,
  storeTheme = "turquoise",
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
        className={`customer-store-root ${themeClass} customer-center-modal__panel relative flex max-h-[min(88dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-[24px] shadow-[0_12px_40px_rgba(58,47,38,0.2)] ${panelClassName}`}
      >
        {header ??
          (title ? (
            <CustomerModalHeaderBar
              title={title}
              onClose={onClose}
              closeLabel={closeLabel}
            />
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
