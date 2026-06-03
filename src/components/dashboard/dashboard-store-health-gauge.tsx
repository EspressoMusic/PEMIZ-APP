"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Star, X } from "lucide-react";
import { DashboardHomeGauge } from "@/components/dashboard/dashboard-home-gauge";
import type { StoreHealthSnapshot } from "@/lib/store-health-score";
import { DEV_STORE_HEALTH } from "@/lib/dev-preview-data";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

function DeductionIcon({ kind }: { kind: string }) {
  if (kind === "bad_review") {
    return <Star className="h-5 w-5 shrink-0 text-bakery-error" strokeWidth={2} />;
  }
  return (
    <MessageCircle className="h-5 w-5 shrink-0 text-bakery-primary" strokeWidth={2} />
  );
}

export function DashboardStoreHealthGauge({
  businessSlug: _businessSlug,
  inquiriesHref,
  previewOnly = false,
  className = "",
}: {
  businessSlug: string;
  inquiriesHref: string;
  previewOnly?: boolean;
  className?: string;
}) {
  const { labels } = useAppLocale();
  const [health, setHealth] = useState<StoreHealthSnapshot>({
    percent: 100,
    deductions: [],
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(!previewOnly);

  const load = useCallback(async () => {
    if (previewOnly) {
      setHealth(DEV_STORE_HEALTH);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/dashboard/store-health");
    const data = await res.json();
    if (res.ok && typeof data.percent === "number") {
      setHealth({
        percent: data.percent,
        deductions: data.deductions ?? [],
      });
    }
    setLoading(false);
  }, [previewOnly]);

  useEffect(() => {
    void load();
    if (previewOnly) return;
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load, previewOnly]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function closePanel() {
    setOpen(false);
  }

  const { percent, deductions } = health;
  const perfect = deductions.length === 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`min-w-0 flex-1 rounded-[18px] text-start transition active:scale-[0.99] hover:opacity-95 ${className}`}
        aria-label={
          loading
            ? labels.storeHealthTitle
            : `${labels.storeHealthTitle} ${percent}%`
        }
      >
        <DashboardHomeGauge
          percent={loading ? 100 : percent}
          tall
          className="w-full pointer-events-none"
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={labels.storeHealthTitle}
        >
          <button
            type="button"
            className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
            onClick={closePanel}
            aria-label={labels.close}
          />
          <div className="relative max-h-[min(85dvh,560px)] w-full max-w-md overflow-hidden rounded-[24px] border border-bakery-border/30 bg-bakery-cream-sheet shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
            <div className="relative border-b border-bakery-border/25 px-4 py-3">
              <button
                type="button"
                onClick={closePanel}
                className="absolute end-2 top-2 rounded-full p-2 text-bakery-muted hover:bg-bakery-primary/10"
                aria-label={labels.close}
              >
                <X className="h-6 w-6" />
              </button>
              <div className="px-10 text-center">
                <h2 className="text-[18px] font-extrabold text-bakery-ink">
                  {labels.storeHealthTitle}
                </h2>
                <p className="text-[13px] font-semibold text-bakery-muted">
                  {perfect
                    ? labels.storeHealthPerfect
                    : `${percent}%`}
                </p>
              </div>
            </div>

            <div className="max-h-[50dvh] overflow-y-auto px-4 py-4">
              {perfect ? (
                <p className="rounded-[16px] bg-bakery-cream-light px-4 py-6 text-center text-[14px] font-semibold leading-relaxed text-bakery-muted">
                  {labels.storeHealthPerfect}
                </p>
              ) : (
                <ul className="space-y-2.5 text-center">
                  {deductions.map((d) => (
                    <li
                      key={d.id}
                      className="rounded-[16px] border border-bakery-border/25 bg-bakery-cream-light p-3"
                    >
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <DeductionIcon kind={d.kind} />
                        <p className="text-[15px] font-extrabold text-bakery-ink">
                          {d.label}
                        </p>
                        <span className="text-[13px] font-extrabold text-bakery-error">
                          −{d.penaltyPercent}%
                        </span>
                      </div>
                      <p className="mt-2 text-[13px] leading-snug text-bakery-muted">
                        {d.detail}
                      </p>
                      {d.href && (
                        <Link
                          href={d.href}
                          onClick={closePanel}
                          className="mt-2 inline-block text-[12px] font-bold text-bakery-primary hover:underline"
                        >
                          {labels.answerCustomer} →
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!perfect && (
              <div className="border-t border-bakery-border/20 px-4 py-3">
                <Link
                  href={inquiriesHref}
                  onClick={closePanel}
                  className="flex min-h-[48px] w-full items-center justify-center rounded-[18px] border-[1.2px] border-bakery-border/40 bg-bakery-square text-[15px] font-medium text-bakery-ink transition hover:bg-bakery-card"
                >
                  {labels.customerInquiries}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
