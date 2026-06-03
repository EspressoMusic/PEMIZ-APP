"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button, Input } from "@/components/ui";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { formatCustomerMoney } from "@/lib/customer-money";

export function OrderCheckoutModal({
  open,
  onClose,
  locale,
  total,
  initialName,
  initialPhone,
  onSubmit,
  submitting,
  error,
  summary,
}: {
  open: boolean;
  onClose: () => void;
  locale: CustomerLocale;
  total: number;
  initialName: string;
  initialPhone: string;
  onSubmit: (name: string, phone: string) => void;
  submitting: boolean;
  error?: string;
  summary?: string;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  useEffect(() => {
    if (open) {
      setName(initialName);
      setPhone(initialPhone);
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open, initialName, initialPhone]);

  if (!open) return null;

  const t =
    locale === "he"
      ? {
          title: "פרטים להשלמת ההזמנה",
          name: "שם",
          phone: "טלפון",
          total: 'סה"כ',
          submit: "אישור הזמנה",
          submitting: "שולח...",
          close: "סגור",
        }
      : {
          title: "Complete your order",
          name: "Name",
          phone: "Phone",
          total: "Total",
          submit: "Confirm order",
          submitting: "Sending...",
          close: "Close",
        };

  return (
    <div
      className="fixed inset-0 z-[75] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t.close}
      />

      <div className="relative w-full max-w-md rounded-t-[28px] bg-bakery-cream-sheet p-5 shadow-[0_-8px_32px_rgba(58,47,38,0.18)] sm:rounded-[28px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-extrabold text-bakery-ink">{t.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-bakery-ink hover:bg-bakery-card/80"
            aria-label={t.close}
          >
            <X className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>

        {summary && (
          <p className="mb-2 text-[14px] font-semibold text-bakery-muted">
            {summary}
          </p>
        )}

        <p className="mb-4 text-[16px] font-extrabold text-bakery-ink">
          {t.total}: {formatCustomerMoney(total, locale)}
        </p>

        {error && (
          <p className="mb-3 rounded-2xl bg-bakery-error/10 px-3 py-2 text-[14px] text-bakery-error">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <Input
            label={t.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label={t.phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            dir="ltr"
          />
          <Button
            type="button"
            className="w-full min-h-[48px]"
            disabled={submitting}
            onClick={() => onSubmit(name.trim(), phone.trim())}
          >
            {submitting ? t.submitting : t.submit}
          </Button>
        </div>
      </div>
    </div>
  );
}
