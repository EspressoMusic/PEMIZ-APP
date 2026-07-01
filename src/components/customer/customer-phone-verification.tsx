"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import type { CustomerLabels } from "@/components/customer/customer-labels";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { parseIsraeliMobilePhone } from "@/lib/phone";

export function CustomerPhoneVerification({
  slug,
  phone,
  locale,
  labels,
  onVerified,
  compact = false,
}: {
  slug: string;
  phone: string;
  locale: CustomerLocale;
  labels: CustomerLabels;
  onVerified: () => void;
  compact?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const phoneNorm = parseIsraeliMobilePhone(phone);
  if (!phoneNorm) return null;

  async function confirm() {
    setError("");
    setConfirming(true);
    try {
      const res = await fetch(`/api/public/${slug}/phone/confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNorm }),
      });
      const data = (await res.json()) as { error?: string; confirmed?: boolean };
      if (!res.ok) {
        setError(data.error ?? labels.phoneVerifyError);
        return;
      }
      onVerified();
    } catch {
      setError(labels.phoneVerifyError);
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-amber-200/80 bg-amber-50/90 p-3 text-sm"
          : "rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4"
      }
      dir={locale === "he" ? "rtl" : "ltr"}
    >
      <p className="mb-3 text-[var(--store-text)]">{labels.phoneVerifyIntro}</p>
      <Button
        type="button"
        className="w-full"
        disabled={confirming}
        onClick={() => void confirm()}
      >
        {confirming ? labels.phoneVerifyConfirming : labels.phoneVerifyConfirm}
      </Button>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
