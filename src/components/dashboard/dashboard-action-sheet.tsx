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
  elevated = false,
  compact = false,
  warmPanel = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  ariaLabel?: string;
  children: ReactNode;
  /** Store hub: grid at top; upper = near top for tall forms. */
  placement?: "top" | "bottom" | "center" | "upper";
  showBackButton?: boolean;
  backButtonLabel?: string;
  /** Above seller live tour overlay while highlighting items inside the sheet. */
  elevated?: boolean;
  /** Tighter padding, header back button, taller viewport use (e.g. add-product form). */
  compact?: boolean;
  /** Warm #e6d5b8 panel fill (e.g. add-service modal). */
  warmPanel?: boolean;
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
      : placement === "upper"
        ? "items-start justify-center pt-2 pb-2 sm:pt-3"
      : placement === "center"
        ? "items-center justify-center"
        : "items-end justify-center pb-4 sm:pb-6";

  const backControl = showBackButton ? (
    <button
      type="button"
      onClick={onClose}
      className="inline-flex min-h-[40px] w-fit items-center gap-1 px-1 text-[15px] font-extrabold text-bakery-ink transition active:opacity-80"
    >
      <ChevronLeft className="h-5 w-5 rtl:rotate-180" strokeWidth={2.5} />
      {backButtonLabel ?? labels.back}
    </button>
  ) : null;

  const panelMaxHeight = compact
    ? "max-h-[min(calc(100dvh-1.25rem),720px)]"
    : "max-h-[min(88vh,640px)]";

  return createPortal(
    <div
      className={`fixed inset-0 flex p-3 sm:p-4 ${elevated ? "z-[125]" : "z-[80]"} ${alignClass}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title ?? closeLabel}
    >
      <button
        type="button"
        className={`dashboard-action-sheet-backdrop absolute inset-0 ${
          elevated ? "pointer-events-none" : ""
        }`}
        onClick={elevated ? undefined : onClose}
        aria-label={closeLabel}
        tabIndex={elevated ? -1 : undefined}
      />
      <div
        className={`relative z-10 flex w-full max-w-md flex-col ${
          compact ? "gap-0" : "gap-2"
        } ${panelMaxHeight}`}
      >
        {showBackButton && !compact ? backControl : null}
        <div
          className={`dashboard-surface dashboard-card bakery-action-sheet-panel relative flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-[32px] ${panelMaxHeight}${
            warmPanel ? " bakery-action-sheet-panel--warm" : ""
          }`}
        >
          {compact && showBackButton && title ? (
            <div className="relative shrink-0 px-3 pb-1 pt-3">
              <div className="absolute start-2 top-2.5 z-10">{backControl}</div>
              <h2 className="px-10 text-center text-[17px] font-extrabold leading-tight text-bakery-ink">
                {title}
              </h2>
            </div>
          ) : title ? (
            <h2
              className={`shrink-0 text-center font-extrabold text-bakery-ink ${
                compact
                  ? "px-3 pb-1 pt-3 text-[17px]"
                  : "px-4 pt-4 text-[18px]"
              }`}
            >
              {title}
            </h2>
          ) : null}
          <div
            className={`dashboard-action-sheet-body min-h-0 flex-1 overflow-y-auto ${
              title
                ? compact
                  ? "px-3 pb-3 pt-1"
                  : "px-4 pb-4 pt-2"
                : compact
                  ? "p-2.5"
                  : "p-3"
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
