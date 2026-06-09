"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";
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
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const phoneNorm = parseIsraeliMobilePhone(phone);
  if (!phoneNorm) return null;

  async function sendOtp() {
    setError("");
    setSending(true);
    try {
      const res = await fetch(`/api/public/${slug}/phone/send`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNorm }),
      });
      const data = (await res.json()) as { error?: string; devCode?: string };
      if (!res.ok) {
        setError(data.error ?? labels.phoneVerifySendError);
        return;
      }
      setSent(true);
      if (data.devCode) setCode(data.devCode);
    } catch {
      setError(labels.phoneVerifySendError);
    } finally {
      setSending(false);
    }
  }

  async function verify() {
    const trimmed = code.trim();
    if (trimmed.length < 4) {
      setError(labels.phoneVerifyCodeRequired);
      return;
    }
    setError("");
    setVerifying(true);
    try {
      const res = await fetch(`/api/public/${slug}/phone/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNorm, code: trimmed }),
      });
      const data = (await res.json()) as { error?: string; verified?: boolean };
      if (!res.ok) {
        setError(data.error ?? labels.phoneVerifyError);
        return;
      }
      onVerified();
    } catch {
      setError(labels.phoneVerifyError);
    } finally {
      setVerifying(false);
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
      {!sent ? (
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={sending}
          onClick={() => void sendOtp()}
        >
          {sending ? labels.phoneVerifySending : labels.phoneVerifySend}
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={labels.phoneVerifyCodePlaceholder}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
          <Button
            type="button"
            className="w-full"
            disabled={verifying}
            onClick={() => void verify()}
          >
            {verifying ? labels.phoneVerifyConfirming : labels.phoneVerifyConfirm}
          </Button>
          <button
            type="button"
            className="text-xs text-[var(--store-muted)] underline"
            disabled={sending}
            onClick={() => void sendOtp()}
          >
            {labels.phoneVerifyResend}
          </button>
        </div>
      )}
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
