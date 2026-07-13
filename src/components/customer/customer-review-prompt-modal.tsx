"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button, Textarea } from "@/components/ui";
import { CustomerCenterModal } from "@/components/customer/customer-center-modal";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import { hasReviewedStore, markReviewedStore } from "@/lib/customer-reviewed-flag";
import type { CustomerLabels } from "./customer-labels";

export type ReviewRewardCoupon = {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
};

export function CustomerReviewPromptModal({
  open,
  onClose,
  slug,
  customerName,
  locale,
  storeTheme = "turquoise",
  labels,
  onRewardCoupon,
}: {
  open: boolean;
  onClose: () => void;
  slug: string;
  customerName: string;
  locale: CustomerLocale;
  storeTheme?: StoreThemeId;
  labels: CustomerLabels;
  onRewardCoupon?: (coupon: ReviewRewardCoupon) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setRating(0);
    setComment("");
    setError("");
    if (hasReviewedStore(slug)) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slug]);

  if (!open || hasReviewedStore(slug)) return null;

  async function submit() {
    if (rating < 1) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/public/${slug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          rating,
          comment: comment.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((data as { error?: string }).error ?? labels.reviewSubmitError);
        setSubmitting(false);
        return;
      }
      markReviewedStore(slug);
      const reward = (data as { rewardCoupon?: ReviewRewardCoupon | null }).rewardCoupon;
      if (reward) onRewardCoupon?.(reward);
      onClose();
    } catch {
      setError(labels.reviewSubmitError);
      setSubmitting(false);
    }
  }

  return (
    <CustomerCenterModal
      open={open}
      onClose={onClose}
      title={labels.reviewPromptTitle}
      locale={locale}
      storeTheme={storeTheme}
      bodyClassName="px-5 py-5"
      panelClassName="max-h-fit"
    >
      <div className="space-y-4 text-center">
        <p className="text-[14px] font-semibold text-bakery-muted">
          {labels.reviewPromptSubtitle}
        </p>

        <div className="flex items-center justify-center gap-1.5" dir="ltr">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={String(value)}
              className="p-1 transition active:scale-90"
            >
              <Star
                className={`h-9 w-9 ${
                  value <= rating
                    ? "fill-bakery-primary text-bakery-primary"
                    : "text-bakery-border"
                }`}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={labels.reviewCommentPlaceholder}
          rows={3}
          className="text-start"
        />

        {error ? (
          <p role="alert" className="text-[14px] font-semibold text-bakery-error">
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Button
            type="button"
            className="w-full min-h-[48px] font-extrabold"
            disabled={rating < 1 || submitting}
            onClick={submit}
          >
            {labels.reviewSubmit}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-[14px] font-semibold text-bakery-muted"
          >
            {labels.reviewSkip}
          </button>
        </div>
      </div>
    </CustomerCenterModal>
  );
}
