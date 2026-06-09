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
  warmPanel = true,
  /** Fit all children without an inner scroll area (tight modals). */
  fitContent = false,
  panelClassName,
  backButtonOutside = false,
  /** Full-height sheet from top to bottom; disabled automatically when fitContent. */
  expanded = true,
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
  fitContent?: boolean;
  panelClassName?: string;
  /** עם compact — מציב את «חזרה» מעל המלבן ולא בתוך הכותרת */
  backButtonOutside?: boolean;
  expanded?: boolean;
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

  const fullViewport = expanded && !fitContent;

  const alignClass = fullViewport
    ? "items-stretch justify-center p-0"
    : placement === "top"
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

  const panelMaxHeight = fullViewport
    ? "h-full min-h-0 max-h-none"
    : fitContent
      ? "max-h-[min(calc(100dvh-1rem),820px)]"
      : compact
        ? "max-h-[min(calc(100dvh-1.25rem),720px)]"
        : "max-h-[min(88vh,640px)]";

  const backOutside =
    !fullViewport && showBackButton && (!compact || backButtonOutside);

  const wrapperHeightClass = fullViewport
    ? "h-full min-h-0"
    : panelMaxHeight;

  const panelHeightClass = fullViewport
    ? "min-h-0 flex-1"
    : panelMaxHeight;

  return createPortal(
    <div
      className={`fixed inset-0 flex ${fullViewport ? "" : "p-3 sm:p-4"} ${elevated ? "z-[125]" : "z-[80]"} ${alignClass}`}
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
        className={`relative z-10 flex w-full flex-col ${
          fullViewport ? "max-w-none" : "max-w-md"
        } ${compact && !backOutside ? "gap-0" : fullViewport ? "gap-0" : "gap-2"} ${wrapperHeightClass}`}
      >
        {backOutside ? backControl : null}
        <div
          className={`dashboard-surface dashboard-card bakery-action-sheet-panel relative flex w-full flex-col ${
            fullViewport ? "rounded-none bakery-action-sheet-panel--fullscreen" : "rounded-[32px]"
          } ${panelHeightClass} ${
            fitContent ? "overflow-visible" : "min-h-0 flex-1 overflow-hidden"
          } bakery-action-sheet-panel--warm${
            panelClassName ? ` ${panelClassName}` : ""
          }`}
        >
          {(compact || fullViewport) && showBackButton && title && !backOutside ? (
            <div className="relative shrink-0 px-3 pb-1 pt-3">
              <div className="absolute start-2 top-2.5 z-10">{backControl}</div>
              <h2
                className={`px-10 text-center font-extrabold leading-tight text-bakery-ink ${
                  compact ? "text-[17px]" : "text-[18px]"
                }`}
              >
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
            className={`dashboard-action-sheet-body ${
              fitContent
                ? "shrink-0 overflow-visible"
                : "flex min-h-0 flex-1 flex-col overflow-y-auto"
            } ${
              title
                ? compact || fitContent
                  ? "px-3 pb-3 pt-1"
                  : "px-4 pb-4 pt-2"
                : compact || fitContent
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
