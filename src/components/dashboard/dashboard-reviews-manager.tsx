"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Star, Trash2 } from "lucide-react";
import { Alert, Textarea } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import type { DashboardLabels } from "@/lib/dashboard-messages";

type ReviewRow = {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  sellerReply?: string | null;
  sellerReplyAt?: string | null;
  createdAt: string;
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`h-4 w-4 ${
            value <= rating
              ? "fill-bakery-primary text-bakery-primary"
              : "text-bakery-border"
          }`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  expanded,
  isReplying,
  replyDraft,
  onToggle,
  onStartReply,
  onCancelReply,
  onDraftChange,
  onSendReply,
  onDelete,
  labels,
  formatDateTime,
  formatDayDate,
}: {
  review: ReviewRow;
  expanded: boolean;
  isReplying: boolean;
  replyDraft: string;
  onToggle: () => void;
  onStartReply: () => void;
  onCancelReply: () => void;
  onDraftChange: (value: string) => void;
  onSendReply: () => void;
  onDelete: () => void;
  labels: DashboardLabels;
  formatDateTime: (iso: string) => string;
  formatDayDate: (iso: string) => string;
}) {
  return (
    <li className="space-y-2">
      <div
        className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
          expanded ? "bakery-float-tile--active" : ""
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-start"
        >
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="block text-[16px] font-extrabold leading-tight text-bakery-ink">
                {review.customerName}
              </span>
              <StarRow rating={review.rating} />
            </span>
            <span className="mt-0.5 block text-[13px] font-medium text-bakery-muted">
              {formatDayDate(review.createdAt)}
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
          {review.comment ? (
            <div className="dashboard-inquiry-bubble">
              <p className="whitespace-pre-wrap text-[13px] leading-snug text-bakery-ink">
                {review.comment}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-bakery-muted">
                {formatDateTime(review.createdAt)}
              </p>
            </div>
          ) : null}

          {review.sellerReply && !isReplying && (
            <button
              type="button"
              onClick={onStartReply}
              className="dashboard-inquiry-reply w-full text-start transition active:scale-[0.99]"
            >
              <p className="text-[11px] font-bold text-bakery-primary">
                {labels.yourReply}
              </p>
              <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-snug text-bakery-ink">
                {review.sellerReply}
              </p>
              {review.sellerReplyAt && (
                <p className="mt-0.5 text-[10px] text-bakery-muted">
                  {formatDateTime(review.sellerReplyAt)}
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
            !review.sellerReply && (
              <button
                type="button"
                className="dashboard-inquiry-cta"
                onClick={onStartReply}
              >
                {labels.answerCustomer}
              </button>
            )
          )}

          <button
            type="button"
            onClick={onDelete}
            className="flex w-full items-center justify-center gap-1.5 rounded-[16px] px-3 py-2 text-[13px] font-bold text-bakery-error transition active:scale-[0.99]"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
            {labels.deleteReview}
          </button>
        </div>
      )}
    </li>
  );
}

export function DashboardReviewsManager({
  previewOnly = false,
  initialItems = [] as ReviewRow[],
}: {
  previewOnly?: boolean;
  initialItems?: ReviewRow[];
}) {
  const { labels, formatDateTime, formatDayDate } = useAppLocale();
  const [items, setItems] = useState<ReviewRow[]>(
    previewOnly ? initialItems : []
  );
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    if (previewOnly) return;
    const res = await fetch("/api/dashboard/reviews");
    const data = await res.json();
    if (res.ok) setItems(data.reviews ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const res = await fetch(`/api/dashboard/reviews/${id}`, {
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

  async function deleteReview(id: string) {
    setError("");
    if (previewOnly) {
      setItems((prev) => prev.filter((row) => row.id !== id));
      return;
    }
    const res = await fetch(`/api/dashboard/reviews/${id}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((data as { error?: string }).error ?? labels.networkError);
      return;
    }
    setExpandedId((current) => (current === id ? null : current));
    load();
  }

  return (
    <div className="space-y-3 pb-2 text-center">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="dashboard-card bakery-float-panel rounded-[32px] p-3 text-start">
        <ul className="space-y-2">
          {items.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              expanded={expandedId === review.id}
              isReplying={replyingId === review.id}
              replyDraft={replyDrafts[review.id] ?? review.sellerReply ?? ""}
              labels={labels}
              formatDateTime={formatDateTime}
              formatDayDate={formatDayDate}
              onToggle={() => {
                setExpandedId((current) => {
                  if (current === review.id) {
                    setReplyingId(null);
                    return null;
                  }
                  return review.id;
                });
              }}
              onStartReply={() => {
                setExpandedId(review.id);
                setReplyingId(review.id);
                setReplyDrafts((d) => ({
                  ...d,
                  [review.id]: d[review.id] ?? review.sellerReply ?? "",
                }));
              }}
              onCancelReply={() => setReplyingId(null)}
              onDraftChange={(value) =>
                setReplyDrafts((d) => ({ ...d, [review.id]: value }))
              }
              onSendReply={() => void sendReply(review.id)}
              onDelete={() => void deleteReview(review.id)}
            />
          ))}
          {items.length === 0 && (
            <li className="dashboard-action-square rounded-[22px] px-3 py-6 text-center text-[14px] font-medium text-bakery-muted">
              {labels.noReviewsYet}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
