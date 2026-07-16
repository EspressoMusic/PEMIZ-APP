"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { requestAndSubscribePush } from "@/lib/push-client";
import { DEFAULT_SELLER_ALERTS, type SellerAlertsSettings } from "@/lib/seller-alerts";

const STORAGE_PREFIX = "linky_seller_notify_prompt_done:";
const GUIDE_STORAGE_PREFIX = "linky_seller_guide_done:";

function storageKey(businessId: string) {
  return `${STORAGE_PREFIX}${businessId}`;
}

export function SellerNotifyPrompt({
  businessId,
  waitForGuide,
}: {
  businessId: string;
  /** Wait for the seller-welcome-guide tour to finish before asking (pass false if that tour is disabled). */
  waitForGuide: boolean;
}) {
  const { labels } = useAppLocale();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const checkedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  const finish = useCallback(() => {
    localStorage.setItem(storageKey(businessId), "1");
    setOpen(false);
  }, [businessId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(storageKey(businessId)) === "1") return;

    let cancelled = false;

    function isGuideDone() {
      return (
        !waitForGuide ||
        localStorage.getItem(`${GUIDE_STORAGE_PREFIX}${businessId}`) === "1"
      );
    }

    async function check() {
      if (checkedRef.current) return;
      if (!isGuideDone()) return;
      checkedRef.current = true;

      try {
        const res = await fetch("/api/dashboard/seller-alerts", {
          credentials: "same-origin",
        });
        const data = (await res.json().catch(() => null)) as
          | { enabled?: boolean }
          | null;
        if (res.ok && data?.enabled) {
          localStorage.setItem(storageKey(businessId), "1");
          return;
        }
      } catch {
        // network hiccup — still ask, the seller can dismiss if not interested
      }
      // Re-check: the guide may have been replayed while this request was in
      // flight — don't surface the prompt on top of a freshly-restarted tour.
      if (!isGuideDone()) {
        checkedRef.current = false;
        return;
      }
      if (!cancelled) setOpen(true);
    }

    void check();
    const interval = setInterval(() => void check(), 500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [businessId, waitForGuide]);

  async function enableAll() {
    setBusy(true);
    try {
      const next: SellerAlertsSettings = {
        ...DEFAULT_SELLER_ALERTS,
        enabled: true,
      };
      await fetch("/api/dashboard/seller-alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      await requestAndSubscribePush();
    } catch {
      // best effort — the seller can still finish setup from Settings > Alerts
    } finally {
      finish();
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seller-notify-prompt-title"
    >
      <div className="absolute inset-0 bg-bakery-ink/45" aria-hidden />
      <div className="relative z-10 mx-auto w-full max-w-sm rounded-[24px] border border-bakery-border/40 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-mid p-5 text-center shadow-[var(--shadow-bakery-panel)]">
        <h2
          id="seller-notify-prompt-title"
          className="text-[19px] font-extrabold text-bakery-ink"
        >
          {labels.sellerNotifyPromptTitle}
        </h2>
        <p className="mt-2 text-[15px] font-semibold leading-relaxed text-bakery-muted">
          {labels.sellerNotifyPromptBody}
        </p>
        <div className="mt-5 flex flex-col items-center gap-2">
          <Button
            type="button"
            className="bakery-cta-3d bakery-cta-3d--primary min-h-[44px] w-auto min-w-[220px] !rounded-full !shadow-none font-extrabold hover:!opacity-100"
            disabled={busy}
            onClick={() => void enableAll()}
          >
            {busy ? labels.chatLoading : labels.sellerNotifyPromptYes}
          </Button>
          <button
            type="button"
            onClick={finish}
            disabled={busy}
            className="min-h-[40px] text-[14px] font-bold text-bakery-muted transition hover:text-bakery-ink"
          >
            {labels.sellerNotifyPromptNo}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
