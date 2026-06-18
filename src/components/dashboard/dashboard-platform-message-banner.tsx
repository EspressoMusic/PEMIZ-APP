"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { isPlatformOwnerMessageUnread } from "@/lib/platform-owner-message";

export function DashboardPlatformMessageBanner({
  initialMessage = null,
  initialMessageAt = null,
  initialReadAt = null,
  previewOnly = false,
}: {
  initialMessage?: string | null;
  initialMessageAt?: string | null;
  initialReadAt?: string | null;
  previewOnly?: boolean;
}) {
  const { labels } = useAppLocale();
  const [message] = useState(initialMessage?.trim() ?? "");
  const [messageAt] = useState(initialMessageAt);
  const [readAt, setReadAt] = useState(initialReadAt);
  const [open, setOpen] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  const unread = isPlatformOwnerMessageUnread(message, messageAt, readAt);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const dismiss = useCallback(async () => {
    setDismissing(true);
    try {
      if (!previewOnly) {
        await fetch("/api/dashboard/platform-message", { method: "PATCH" });
      }
      setReadAt(new Date().toISOString());
      setOpen(false);
    } finally {
      setDismissing(false);
    }
  }, [previewOnly]);

  if (!message || !unread) return null;

  return (
    <>
      <div className="shrink-0 px-3 pt-2 sm:px-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-[16px] border border-bakery-primary/25 bg-gradient-to-b from-[#faf3e8] to-[#f0e4d4] px-4 py-3 text-start shadow-[0_4px_14px_rgba(58,47,38,0.08)] transition hover:brightness-[1.02] active:scale-[0.99]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bakery-primary/15 text-bakery-primary">
            <Megaphone className="h-5 w-5" strokeWidth={2} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-extrabold text-bakery-ink">
              {labels.platformOwnerMessageTitle}
            </span>
            <span className="mt-0.5 block truncate text-[13px] font-semibold text-bakery-muted">
              {message}
            </span>
          </span>
        </button>
      </div>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[130] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-label={labels.platformOwnerMessageTitle}
            >
              <button
                type="button"
                className="absolute inset-0 bg-bakery-ink/55 backdrop-blur-[2px]"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
              />
              <div className="relative flex max-h-[min(80dvh,520px)] w-full max-w-md flex-col overflow-hidden rounded-[24px] border border-bakery-border/40 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-mid shadow-[var(--shadow-bakery-panel)]">
                <div className="relative flex min-h-[52px] shrink-0 items-center justify-center px-12 py-3">
                  <h2 className="w-full text-center text-[18px] font-extrabold text-bakery-ink">
                    {labels.platformOwnerMessageTitle}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-bakery-muted transition hover:bg-bakery-card/80"
                    aria-label={labels.close}
                  >
                    <X className="h-5 w-5" strokeWidth={2} />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-1">
                  <div className="rounded-[16px] border border-bakery-border/30 bg-bakery-card/80 px-4 py-5">
                    <p className="whitespace-pre-wrap text-center text-[16px] font-semibold leading-[1.55] text-bakery-ink">
                      {message}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 px-4 py-4">
                  <Button
                    type="button"
                    variant="primary"
                    className="bakery-cta-3d bakery-cta-3d--primary w-full min-h-[48px] !max-w-none !rounded-full text-[15px] font-extrabold"
                    disabled={dismissing}
                    onClick={() => void dismiss()}
                  >
                    {dismissing ? labels.saving : labels.platformOwnerMessageGotIt}
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
