"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Alert, Textarea, PageTitle } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  customerProfileInitial,
  useDashboardCustomerProfile,
  type CustomerProfileInput,
} from "@/components/dashboard/dashboard-customer-profile";
import type { DashboardLabels } from "@/lib/dashboard-messages";

type InquiryRow = {
  id: string;
  customerName: string;
  subject?: string;
  message: string;
  customerPhone?: string | null;
  sellerReply?: string | null;
  sellerReplyAt?: string | null;
  createdAt: string;
};

function InquiryCard({
  inquiry,
  expanded,
  isReplying,
  replyDraft,
  onToggle,
  onCustomerClick,
  onStartReply,
  onCancelReply,
  onDraftChange,
  onSendReply,
  labels,
  formatDateTime,
  formatDayDate,
}: {
  inquiry: InquiryRow;
  expanded: boolean;
  isReplying: boolean;
  replyDraft: string;
  onToggle: () => void;
  onCustomerClick?: (input: CustomerProfileInput) => void;
  onStartReply: () => void;
  onCancelReply: () => void;
  onDraftChange: (value: string) => void;
  onSendReply: () => void;
  labels: DashboardLabels;
  formatDateTime: (iso: string) => string;
  formatDayDate: (iso: string) => string;
}) {
  const pending = !inquiry.sellerReply;

  return (
    <li className="space-y-2">
      <div
        className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
          expanded ? "bakery-float-tile--active" : ""
        }`}
      >
        <button
          type="button"
          onClick={() =>
            inquiry.customerPhone &&
            onCustomerClick?.({
              customerName: inquiry.customerName,
              customerPhone: inquiry.customerPhone,
              fallbackDate: inquiry.createdAt,
            })
          }
          className="relative shrink-0"
          aria-label={`${labels.customer}: ${inquiry.customerName}`}
        >
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[14px] border border-bakery-border/35 bg-bakery-on-primary text-[18px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]">
            {customerProfileInitial(
              inquiry.customerName,
              labels.anonymousCustomer
            )}
          </span>
          {pending && (
            <span
              className="dashboard-inquiry-pending-dot"
              aria-label={labels.pending}
            />
          )}
        </button>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-start"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-extrabold leading-tight text-bakery-ink">
              {inquiry.customerName}
            </span>
            <span className="mt-0.5 block text-[13px] font-medium text-bakery-muted">
              {formatDayDate(inquiry.createdAt)}
            </span>
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>
      </div>

      {expanded && (
        <div className="dashboard-inquiry-expanded space-y-2">
          <div className="dashboard-inquiry-bubble">
            <p className="text-[11px] font-bold text-bakery-muted">
              {labels.customerInquiryLabel}
            </p>
            {inquiry.subject ? (
              <p className="mt-0.5 text-[14px] font-extrabold leading-snug text-bakery-ink">
                {inquiry.subject}
              </p>
            ) : null}
            <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-snug text-bakery-ink">
              {inquiry.message}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-bakery-muted">
              {formatDateTime(inquiry.createdAt)}
            </p>
          </div>

          {inquiry.sellerReply && !isReplying && (
            <button
              type="button"
              onClick={onStartReply}
              className="dashboard-inquiry-reply w-full text-start transition active:scale-[0.99]"
            >
              <p className="text-[11px] font-bold text-bakery-primary">
                {labels.yourReply}
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-snug text-bakery-ink">
                {inquiry.sellerReply}
              </p>
              {inquiry.sellerReplyAt && (
                <p className="mt-0.5 text-[10px] text-bakery-muted">
                  {formatDateTime(inquiry.sellerReplyAt)}
                </p>
              )}
            </button>
          )}

          {isReplying ? (
            <div className="dashboard-inquiry-bubble space-y-2">
              <Textarea
                label={labels.replyToCustomer}
                labelClassName="block w-full text-center text-[13px] font-extrabold"
                rows={3}
                value={replyDraft}
                onChange={(e) => onDraftChange(e.target.value)}
                className="dashboard-inquiry-reply-field min-h-[88px] resize-y text-[13px] !rounded-[10px]"
              />
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="dashboard-inquiry-cta min-w-[7.5rem]"
                  onClick={onSendReply}
                >
                  {labels.sendReply}
                </button>
                <button
                  type="button"
                  className="dashboard-inquiry-cta dashboard-inquiry-cta--ghost min-w-[5.5rem]"
                  onClick={onCancelReply}
                >
                  {labels.cancel}
                </button>
              </div>
            </div>
          ) : (
            !inquiry.sellerReply && (
              <button
                type="button"
                className="dashboard-inquiry-cta"
                onClick={onStartReply}
              >
                {labels.answerCustomer}
              </button>
            )
          )}
        </div>
      )}
    </li>
  );
}

export function DashboardInquiriesManager({
  previewOnly = false,
  initialItems = [] as InquiryRow[],
  previewOrders,
}: {
  previewOnly?: boolean;
  initialItems?: InquiryRow[];
  previewOrders?: import("@/components/dashboard/dashboard-order-card").DashboardOrderView[];
}) {
  const { labels, formatDateTime, formatDayDate } = useAppLocale();
  const { openCustomer, modal: customerModal } = useDashboardCustomerProfile({
    previewOnly,
    previewOrders,
  });
  const [items, setItems] = useState<InquiryRow[]>(
    previewOnly ? initialItems : []
  );
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    if (previewOnly) return;
    const res = await fetch("/api/dashboard/inquiries");
    const data = await res.json();
    if (res.ok) setItems(data.inquiries ?? []);
  }

  useEffect(() => {
    load();
  }, [previewOnly]);

  async function sendReply(id: string) {
    setError("");
    const text = (replyDrafts[id] ?? "").trim();
    if (!text) {
      setError(labels.replyRequired);
      return;
    }

    if (previewOnly) {
      setItems((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                sellerReply: text,
                sellerReplyAt: new Date().toISOString(),
              }
            : row
        )
      );
      setReplyingId(null);
      return;
    }

    const res = await fetch(`/api/dashboard/inquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerReply: text }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? labels.networkError);
      return;
    }
    setReplyingId(null);
    load();
  }

  const pendingCount = items.filter((q) => !q.sellerReply).length;

  return (
    <div className="space-y-3 pb-2 text-center">
      <PageTitle>{labels.customerInquiries}</PageTitle>
      <p className="text-[13px] font-semibold text-bakery-muted">
        {pendingCount > 0
          ? `${pendingCount} ${labels.inquiriesPending}`
          : labels.inquiriesAllAnswered}
      </p>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="dashboard-card bakery-float-panel rounded-[32px] p-3 text-start">
        <ul className="space-y-2">
        {items.map((q) => (
          <InquiryCard
            key={q.id}
            inquiry={q}
            expanded={expandedId === q.id}
            isReplying={replyingId === q.id}
            replyDraft={replyDrafts[q.id] ?? q.sellerReply ?? ""}
            labels={labels}
            formatDateTime={formatDateTime}
            formatDayDate={formatDayDate}
            onCustomerClick={openCustomer}
            onToggle={() => {
              setExpandedId((current) => {
                if (current === q.id) {
                  setReplyingId(null);
                  return null;
                }
                return q.id;
              });
            }}
            onStartReply={() => {
              setExpandedId(q.id);
              setReplyingId(q.id);
              setReplyDrafts((d) => ({
                ...d,
                [q.id]: d[q.id] ?? q.sellerReply ?? "",
              }));
            }}
            onCancelReply={() => setReplyingId(null)}
            onDraftChange={(value) =>
              setReplyDrafts((d) => ({ ...d, [q.id]: value }))
            }
            onSendReply={() => void sendReply(q.id)}
          />
        ))}
        {items.length === 0 && (
          <li className="dashboard-action-square rounded-[22px] px-3 py-6 text-center text-[14px] font-medium text-bakery-muted">
            {labels.noInquiriesYet}
          </li>
        )}
        </ul>
      </div>
      {customerModal}
    </div>
  );
}
