"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import type { CustomerLabels } from "@/components/customer/customer-labels";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { CustomerResolution } from "@/lib/customer-resolution";

export function CustomerResolutionFeedback({
  locale,
  labels,
  currentResolution,
  submitting = false,
  onSubmit,
  compact = false,
}: {
  locale: CustomerLocale;
  labels: CustomerLabels;
  currentResolution?: string | null;
  submitting?: boolean;
  onSubmit: (resolution: CustomerResolution) => void | Promise<void>;
  compact?: boolean;
}) {
  const [error, setError] = useState("");

  if (currentResolution === "RESOLVED") {
    return (
      <p
        className={`text-center font-semibold text-emerald-700 ${compact ? "text-[12px]" : "text-[13px]"}`}
      >
        {labels.resolutionThanksResolved}
      </p>
    );
  }

  if (currentResolution === "NOT_RESOLVED") {
    return (
      <p
        className={`text-center font-semibold text-amber-800 ${compact ? "text-[12px]" : "text-[13px]"}`}
      >
        {labels.resolutionThanksNotResolved}
      </p>
    );
  }

  async function handleClick(resolution: CustomerResolution) {
    setError("");
    try {
      await onSubmit(resolution);
    } catch {
      setError(labels.resolutionSubmitError);
    }
  }

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-bakery-border/30 bg-bakery-cream-light/80 p-2.5"
          : "rounded-[14px] border border-bakery-border/30 bg-bakery-cream-light/80 p-3"
      }
      dir={locale === "he" ? "rtl" : "ltr"}
    >
      <p
        className={`mb-2 text-center font-bold text-bakery-ink ${compact ? "text-[12px]" : "text-[13px]"}`}
      >
        {labels.resolutionQuestion}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          className="min-h-[40px] min-w-[7rem] text-sm"
          disabled={submitting}
          onClick={() => void handleClick("RESOLVED")}
        >
          {labels.resolutionYes}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-[40px] min-w-[7rem] text-sm"
          disabled={submitting}
          onClick={() => void handleClick("NOT_RESOLVED")}
        >
          {labels.resolutionNo}
        </Button>
      </div>
      {error ? (
        <p className="mt-2 text-center text-[12px] font-semibold text-bakery-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
