"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Button, Textarea } from "@/components/ui";
import { CustomerCenterModal } from "@/components/customer/customer-center-modal";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import type { CustomerLabels } from "./customer-labels";

export function CustomerReviewPromptModal({
  open,
  onClose,
  slug,
  customerName,
  customerPhone,
  locale,
  storeTheme = "turquoise",
  labels,
}: {
  open: boolean;
  onClose: () => void;
  slug: string;
  customerName: string;
  customerPhone: string;
  locale: CustomerLocale;
  storeTheme?: StoreThemeId;
  labels: CustomerLabels;
}) {
  const [checking, setChecking] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setChecking(true);
    setRating(0);
    setComment("");
    setError("");

    async function checkEligibility() {
      try {
        const res = await fetch(
          `/api/public/${slug}/reviews?phone=${encodeURIComponent(customerPhone)}`
        );
        if (cancelled) return;
        if (!res.ok) {
          onClose();
          return;
        }
        const data = (await res.json()) as { hasReviewed?: boolean };
        if (cancelled) return;
        if (data.hasReviewed) {
          onClose();
          return;
        }
        setChecking(false);
      } catch {
        if (!cancelled) onClose();
      }
    }
    void checkEligibility();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slug, customerPhone]);

  if (!open || checking) return null;

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
          customerPhone,
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
