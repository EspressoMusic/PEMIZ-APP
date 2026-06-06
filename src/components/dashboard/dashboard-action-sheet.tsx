"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardActionSheet({
  open,
  onClose,
  title,
  ariaLabel,
  children,
  placement = "bottom",
  showBackButton = false,
  backButtonLabel,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel?: string;
  children: ReactNode;
  /** Store hub: grid at top of screen; default sheet slides from bottom. */
  placement?: "top" | "bottom" | "center";
  showBackButton?: boolean;
  backButtonLabel?: string;
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

  const alignClass =
    placement === "top"
      ? "items-start justify-center pt-4 sm:pt-6"
      : placement === "center"
        ? "items-center justify-center"
        : "items-end justify-center pb-4 sm:pb-6";

  return createPortal(
    <div
      className={`fixed inset-0 z-[80] flex p-4 ${alignClass}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title ?? closeLabel}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-modal-overlay"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <div className="relative z-10 flex w-full max-w-md flex-col gap-2">
        {showBackButton && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] w-fit items-center gap-1 self-start px-1 text-[15px] font-extrabold text-bakery-ink transition active:opacity-80"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" strokeWidth={2.5} />
            {backButtonLabel ?? labels.back}
          </button>
        )}
        <div className="dashboard-surface dashboard-card bakery-action-sheet-panel relative flex max-h-[min(88vh,640px)] w-full flex-col overflow-hidden rounded-[32px]">
          {title ? (
            <h2 className="shrink-0 px-4 pt-4 text-center text-[18px] font-extrabold text-bakery-ink">
              {title}
            </h2>
          ) : null}
          <div
            className={`min-h-0 flex-1 overflow-y-auto ${
              title ? "px-4 pb-4 pt-2" : "p-3"
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
