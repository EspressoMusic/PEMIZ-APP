"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useVisibilityInterval } from "@/hooks/use-visibility-interval";
import Link from "next/link";
import { Bell, X } from "lucide-react";
import { DEV_PREVIEW_INQUIRIES, DEV_PREVIEW_ORDERS } from "@/lib/dev-preview-data";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  customerProfileInitial,
  useDashboardCustomerProfile,
} from "@/components/dashboard/dashboard-customer-profile";

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
  const { openCustomer, modal: customerModal } = useDashboardCustomerProfile({
    previewOnly,
    previewOrders: previewOnly ? DEV_PREVIEW_ORDERS : undefined,
  });
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
  }, [businessSlug, load]);

  useVisibilityInterval(() => void load(), 300_000, 600_000);

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
  const hasPending = pending.length > 0;

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
        className={`bakery-icon-tile relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition ${
          hasPending ? "animate-bell-wiggle" : ""
        }`}
        aria-label={
          hasPending
            ? hasNew
              ? `${labels.inquiryUpdates} (${newPending.length})`
              : `${labels.customerInquiries} (${pending.length})`
            : labels.customerInquiries
        }
      >
        <Bell className="h-6 w-6" strokeWidth={2} />
        {hasPending && (
          <span className="dashboard-inquiry-dot" aria-hidden />
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
            className="dashboard-modal-backdrop absolute inset-0"
            onClick={closePanel}
            aria-label={labels.close}
          />
          <div className="dashboard-modal-card relative max-h-[min(85dvh,560px)] w-full max-w-md overflow-hidden">
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
                      <div className="flex items-start gap-2">
                        {q.customerPhone ? (
                          <button
                            type="button"
                            onClick={() =>
                              openCustomer({
                                customerName: q.customerName,
                                customerPhone: q.customerPhone!,
                                fallbackDate: q.createdAt,
                              })
                            }
                            className="relative shrink-0"
                            aria-label={`${labels.customer}: ${q.customerName}`}
                          >
                            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[12px] border border-bakery-border/35 bg-bakery-on-primary text-[16px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]">
                              {customerProfileInitial(
                                q.customerName,
                                labels.anonymousCustomer
                              )}
                            </span>
                            {isNew && (
                              <span
                                className="dashboard-inquiry-pending-dot"
                                aria-label={labels.pending}
                              />
                            )}
                          </button>
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[16px] font-extrabold text-bakery-ink">
                              {q.customerName}
                            </p>
                            {isNew && !q.customerPhone && (
                              <span className="shrink-0 rounded-full bg-bakery-error px-2 py-0.5 text-[10px] font-bold text-white">
                                {labels.pending}
                              </span>
                            )}
                          </div>
                          {q.customerPhone && (
                            <p
                              className="mt-0.5 text-[13px] text-bakery-muted"
                              dir="ltr"
                            >
                              {q.customerPhone}
                            </p>
                          )}
                        </div>
                      </div>
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
                className="dashboard-elevated-btn flex min-h-[48px] w-full items-center justify-center rounded-[18px] border text-[15px] font-extrabold text-bakery-ink transition active:scale-[0.99]"
              >
                {labels.answerCustomer}
              </Link>
            </div>
          </div>
        </div>
      )}
      {customerModal}
    </>
  );
}
