"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Star, X } from "lucide-react";
import { Button, Input, Textarea } from "@/components/ui";
import { CelebrationModal } from "@/components/celebration-modal";
import { CustomerCenterModal } from "@/components/customer/customer-center-modal";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import { hasReviewedStore, markReviewedStore } from "@/lib/customer-reviewed-flag";
import type { CustomerLabels } from "./customer-labels";

type ReviewEntry = {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  sellerReply?: string | null;
  sellerReplyAt?: string | null;
  createdAt: string;
};

function StarRow({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`${size} ${
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

function StarPicker({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-label={String(value)}
          className="p-1 transition active:scale-90"
        >
          <Star
            className={`h-8 w-8 ${
              value <= rating
                ? "fill-bakery-primary text-bakery-primary"
                : "text-bakery-border"
            }`}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

export function CustomerReviewsSheet({
  open,
  onClose,
  slug,
  locale,
  storeTheme = "turquoise",
  labels,
  customerName = "",
  onNameSave,
}: {
  open: boolean;
  onClose: () => void;
  slug: string;
  locale: CustomerLocale;
  storeTheme?: StoreThemeId;
  labels: CustomerLabels;
  customerName?: string;
  onNameSave?: (name: string) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState(customerName);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [thanksOpen, setThanksOpen] = useState(false);
  const closeLabel = locale === "he" ? "סגור" : "Close";

  function loadReviews() {
    setLoading(true);
    return fetch(`/api/public/${slug}/reviews`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setAverage(data.average ?? 0);
        setCount(data.count ?? 0);
        setReviews(data.reviews ?? []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (!open) return;
    setFormOpen(false);
    setRating(0);
    setComment("");
    setError("");
    setThanksOpen(false);
    setName(customerName);
    void loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slug]);

  async function submitReview() {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError(labels.reviewNameRequired);
      return;
    }
    if (rating < 1) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/public/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: trimmedName,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? labels.reviewSubmitError);
        setSubmitting(false);
        return;
      }
      markReviewedStore(slug);
      onNameSave?.(trimmedName);
      setFormOpen(false);
      setRating(0);
      setComment("");
      await loadReviews();
      setThanksOpen(true);
    } catch {
      setError(labels.reviewSubmitError);
    } finally {
      setSubmitting(false);
    }
  }

  const hasReviewed = hasReviewedStore(slug);

  return (
    <>
    <CustomerCenterModal
      open={open}
      onClose={onClose}
      locale={locale}
      storeTheme={storeTheme}
      ariaLabel={labels.reviews}
      header={
        <div className="flex shrink-0 justify-end border-b border-bakery-border/25 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[15px] font-semibold text-bakery-ink transition hover:bg-bakery-card/80"
          >
            <X className="h-5 w-5" strokeWidth={2} />
            {closeLabel}
          </button>
        </div>
      }
    >
      <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {loading ? null : (
          <div className="space-y-3 pb-2">
            {formOpen ? (
              <div className="customer-faq-card space-y-3 overflow-hidden rounded-[22px] px-4 py-4">
                <StarPicker rating={rating} onChange={setRating} />
                <Input
                  label={labels.yourName}
                  labelClassName="text-center"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-center"
                  required
                />
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={labels.reviewCommentPlaceholder}
                  rows={3}
                  className="text-start"
                />
                {error ? (
                  <p role="alert" className="text-center text-[14px] font-semibold text-bakery-error">
                    {error}
                  </p>
                ) : null}
                <div className="space-y-2">
                  <Button
                    type="button"
                    className="w-full min-h-[48px] font-extrabold"
                    disabled={rating < 1 || submitting}
                    onClick={() => void submitReview()}
                  >
                    {labels.reviewSubmit}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      setError("");
                    }}
                    className="w-full py-2 text-[14px] font-semibold text-bakery-muted"
                  >
                    {labels.reviewCancel}
                  </button>
                </div>
              </div>
            ) : !hasReviewed ? (
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="customer-faq-pill-btn w-full overflow-hidden rounded-full px-5 py-3.5 text-center transition active:scale-[0.99]"
              >
                <span className="text-[16px] font-extrabold leading-snug text-bakery-primary">
                  {labels.addReview}
                </span>
              </button>
            ) : null}

            {count === 0 ? (
              <div className="rounded-[22px] border-[1.2px] border-bakery-border/45 bg-bakery-square px-4 py-8 text-center shadow-[0_3px_10px_rgba(58,47,38,0.1)]">
                <p className="text-[16px] font-bold text-bakery-ink">
                  {labels.reviewsEmptyTitle}
                </p>
                <p className="mt-2 text-[14px] text-bakery-muted">
                  {labels.reviewsEmptySub}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 pb-1">
                  <StarRow rating={Math.round(average)} size="h-5 w-5" />
                  <span className="text-[15px] font-extrabold text-bakery-ink">
                    {average.toFixed(1)}
                  </span>
                  <span className="text-[13px] font-semibold text-bakery-muted">
                    · {count}
                  </span>
                </div>
                <ul className="space-y-3">
                  {reviews.map((review) => (
                    <li
                      key={review.id}
                      className="customer-faq-card overflow-hidden rounded-[22px] px-4 py-3.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[15px] font-extrabold text-bakery-ink">
                          {review.customerName}
                        </span>
                        <StarRow rating={review.rating} />
                      </div>
                      {review.comment ? (
                        <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-[1.5] text-bakery-muted">
                          {review.comment}
                        </p>
                      ) : null}
                      {review.sellerReply ? (
                        <div className="mt-2 rounded-[16px] bg-bakery-square px-3 py-2.5">
                          <p className="text-[12px] font-bold text-bakery-primary">
                            {labels.reviewOwnerReply}
                          </p>
                          <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-[1.5] text-bakery-ink">
                            {review.sellerReply}
                          </p>
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </CustomerCenterModal>
    {thanksOpen &&
      typeof document !== "undefined" &&
      createPortal(
        <CelebrationModal
          open
          onClose={() => setThanksOpen(false)}
          title={labels.reviewThanksTitle}
          subtitle={labels.reviewThanksSubtitle}
          buttonLabel={labels.great}
          closeAriaLabel={closeLabel}
          locale={locale}
        />,
        document.body
      )}
    </>
  );
}
