"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import { DEV_PREVIEW_INQUIRIES } from "@/lib/dev-preview-data";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

type InquiryRow = {
  id: string;
  customerName: string;
  message: string;
  customerPhone?: string | null;
  sellerReply?: string | null;
  createdAt: string;
};

function seenStorageKey(slug: string) {
  return `linky-inquiries-seen-at-${slug}`;
}

function getLastSeenAt(slug: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(seenStorageKey(slug)) ?? "";
}

function markInquiriesSeen(slug: string) {
  localStorage.setItem(seenStorageKey(slug), new Date().toISOString());
}

export function DashboardInquiryBell({
  businessSlug,
  inquiriesHref,
  previewOnly = false,
}: {
  businessSlug: string;
  inquiriesHref: string;
  previewOnly?: boolean;
}) {
  const { labels, formatDateTime } = useAppLocale();
  const [items, setItems] = useState<InquiryRow[]>([]);
  const [lastSeenAt, setLastSeenAt] = useState("");
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => {
    if (previewOnly) {
      setItems(
        DEV_PREVIEW_INQUIRIES.map((row) => ({
          id: row.id,
          customerName: row.customerName,
          message: row.message,
          customerPhone: row.customerPhone,
          sellerReply: row.sellerReply,
          createdAt: row.createdAt,
        }))
      );
      return;
    }
    const res = await fetch("/api/dashboard/inquiries");
    const data = await res.json();
    if (res.ok) setItems(data.inquiries ?? []);
  }, [previewOnly]);

  useEffect(() => {
    setLastSeenAt(getLastSeenAt(businessSlug));
    void load();
    const id = window.setInterval(() => void load(), 45_000);
    return () => window.clearInterval(id);
  }, [businessSlug, load]);

  const pending = useMemo(
    () => items.filter((q) => !q.sellerReply),
    [items]
  );

  const newPending = useMemo(() => {
    if (!lastSeenAt) return pending;
    const seen = new Date(lastSeenAt).getTime();
    return pending.filter((q) => new Date(q.createdAt).getTime() > seen);
  }, [pending, lastSeenAt]);

  const hasNew = newPending.length > 0;

  function openPanel() {
    setOpen(true);
    markInquiriesSeen(businessSlug);
    setLastSeenAt(getLastSeenAt(businessSlug));
  }

  function closePanel() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border border-bakery-border/30 bg-bakery-square shadow-[0_3px_12px_rgba(58,47,38,0.12)] transition hover:bg-bakery-card/90 ${
          hasNew ? "animate-bell-wiggle" : ""
        }`}
        aria-label={
          hasNew
            ? `${labels.inquiryUpdates} (${newPending.length})`
            : labels.customerInquiries
        }
      >
        <Bell className="h-6 w-6 text-bakery-ink" strokeWidth={2} />
        {hasNew && (
          <span
            className="absolute end-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-bakery-error ring-2 ring-[#f9f6f0]"
            aria-hidden
          />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={labels.inquiryUpdates}
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
                  {labels.customerInquiries}
                </h2>
                <p className="text-[13px] font-semibold text-bakery-muted">
                  {hasNew
                    ? `${newPending.length} ${labels.inquiryUpdates}`
                    : pending.length > 0
                      ? `${pending.length} ${labels.inquiriesPending}`
                      : labels.noNewInquiries}
                </p>
              </div>
            </div>

            <ul className="max-h-[50dvh] space-y-3 overflow-y-auto px-4 py-4">
              {pending.length === 0 ? (
                <li className="py-6 text-center text-[14px] text-bakery-muted">
                  {labels.noNewInquiries}
                </li>
              ) : (
                pending.map((q) => {
                  const isNew =
                    !lastSeenAt ||
                    new Date(q.createdAt).getTime() >
                      new Date(lastSeenAt).getTime();
                  return (
                    <li
                      key={q.id}
                      className={`rounded-[18px] border p-3 text-start ${
                        isNew
                          ? "border-bakery-error/35 bg-bakery-cream-light"
                          : "border-bakery-border/25 bg-bakery-cream-light"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[16px] font-extrabold text-bakery-ink">
                          {q.customerName}
                        </p>
                        {isNew && (
                          <span className="shrink-0 rounded-full bg-bakery-error px-2 py-0.5 text-[10px] font-bold text-white">
                            {labels.pending}
                          </span>
                        )}
                      </div>
                      {q.customerPhone && (
                        <p className="mt-0.5 text-[13px] text-bakery-muted" dir="ltr">
                          {q.customerPhone}
                        </p>
                      )}
                      <p className="mt-2 whitespace-pre-wrap text-[14px] leading-snug text-bakery-ink">
                        {q.message}
                      </p>
                      <p className="mt-1 text-[11px] text-bakery-muted">
                        {formatDateTime(q.createdAt)}
                      </p>
                    </li>
                  );
                })
              )}
            </ul>

            <div className="border-t border-bakery-border/20 px-4 py-3">
              <Link
                href={inquiriesHref}
                onClick={closePanel}
                className="flex min-h-[48px] w-full items-center justify-center rounded-[18px] border-[1.2px] border-bakery-border/40 bg-bakery-square text-[15px] font-medium text-bakery-ink shadow-none transition hover:bg-bakery-card"
              >
                {labels.answerCustomer}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
