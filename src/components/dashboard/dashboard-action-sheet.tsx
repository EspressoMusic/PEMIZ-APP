"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DASHBOARD_MOBILE_STACK } from "@/components/dashboard/dashboard-panel-frame";

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
  topLayer = false,
  compact = false,
  warmPanel = true,
  /** Fit all children without an inner scroll area (tight modals). */
  fitContent = false,
  panelClassName,
  backdropClassName,
  backButtonOutside = false,
  /** Centered line at top of compact header (e.g. order date). */
  headerNote,
  /** Opposite corner from back button (e.g. search in history sheet). */
  headerEndAction,
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
  /** Above elevated sheets (e.g. crop modal over add-product form). */
  topLayer?: boolean;
  /** Tighter padding, header back button, taller viewport use (e.g. add-product form). */
  compact?: boolean;
  /** Warm #e6d5b8 panel fill (e.g. add-service modal). */
  warmPanel?: boolean;
  fitContent?: boolean;
  panelClassName?: string;
  /** Extra class(es) for the backdrop (e.g. a stronger tint/blur for a specific panel). */
  backdropClassName?: string;
  /** עם compact — מציב את «חזרה» מעל המלבן ולא בתוך הכותרת */
  backButtonOutside?: boolean;
  headerNote?: string;
  headerEndAction?: ReactNode;
  expanded?: boolean;
}) {
  const { labels } = useAppLocale();
  const closeLabel = labels.close;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  const fullViewport = expanded && !fitContent;

  const alignClass = fullViewport
    ? "items-stretch justify-center p-0 sm:p-4"
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

  const fitContentMaxHeight = backButtonOutside
    ? "max-h-[min(calc(100dvh-3.5rem),820px)]"
    : panelMaxHeight;

  const backOutside = showBackButton && backButtonOutside;

  const wrapperHeightClass = fullViewport
    ? "h-full min-h-0"
    : fitContent
      ? `${fitContentMaxHeight} h-auto overflow-y-auto overscroll-contain`
      : panelMaxHeight;

  const panelHeightClass = fullViewport
    ? "min-h-0 flex-1"
    : fitContent
      ? "h-auto shrink-0"
      : panelMaxHeight;

  const zClass = topLayer ? "z-[130]" : elevated ? "z-[125]" : "z-[80]";
  const backdropPassesThrough = elevated && !topLayer;

  const panelAnimClass =
    placement === "top" || placement === "upper"
      ? "dashboard-action-sheet-panel-in--top"
      : placement === "center"
        ? "dashboard-action-sheet-panel-in--center"
        : "dashboard-action-sheet-panel-in--bottom";

  return createPortal(
    <div
      className={`fixed inset-0 flex ${fullViewport ? "app-safe-top" : ""} ${fullViewport ? "p-0 sm:p-4" : "p-3 sm:p-4"} ${zClass} ${alignClass}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title ?? closeLabel}
    >
      <button
        type="button"
        className={`dashboard-action-sheet-backdrop absolute inset-0 ${
          backdropPassesThrough ? "pointer-events-none" : ""
        }${backdropClassName ? ` ${backdropClassName}` : ""}`}
        onClick={backdropPassesThrough ? undefined : onClose}
        aria-label={closeLabel}
        tabIndex={backdropPassesThrough ? -1 : undefined}
      />
      <div
        className={`relative z-10 flex w-full flex-col ${DASHBOARD_MOBILE_STACK} ${panelAnimClass} ${
          compact && !backOutside
            ? "gap-0"
            : backOutside
              ? "gap-2"
              : fullViewport
                ? "gap-0 sm:gap-2"
                : "gap-2"
        } ${wrapperHeightClass}`}
      >
        {backOutside ? backControl : null}
        <div
          className={`dashboard-surface dashboard-card bakery-action-sheet-panel relative flex w-full flex-col ${
            fullViewport
              ? "rounded-none bakery-action-sheet-panel--fullscreen sm:rounded-[32px]"
              : "rounded-[32px]"
          } ${panelHeightClass} ${
            fitContent
              ? "overflow-visible"
              : "min-h-0 flex-1 overflow-hidden"
          } bakery-action-sheet-panel--warm${
            panelClassName ? ` ${panelClassName}` : ""
          }`}
        >
          {(compact || fullViewport) && showBackButton && !backOutside ? (
            <div className="shrink-0 px-3 pb-1 pt-3">
              {headerNote ? (
                <div className="relative">
                  <div className="absolute start-2 top-2.5 z-10">{backControl}</div>
                  {headerEndAction ? (
                    <div className="absolute end-2 top-2.5 z-10">{headerEndAction}</div>
                  ) : null}
                  <p className="px-10 text-center text-[12px] font-semibold text-bakery-muted">
                    {headerNote}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-start">{backControl}</div>
                  {headerEndAction ? <div>{headerEndAction}</div> : null}
                </div>
              )}
            </div>
          ) : null}
          <div
            className={`dashboard-action-sheet-body ${
              fitContent
                ? "shrink-0 overflow-visible"
                : "flex min-h-0 flex-1 flex-col overflow-y-auto"
            } ${compact || fitContent ? "p-2.5" : "p-3"}${
              backOutside ? " pt-6" : ""
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
