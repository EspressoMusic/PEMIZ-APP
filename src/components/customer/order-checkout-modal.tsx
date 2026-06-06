"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";
import { CustomerCenterModal } from "@/components/customer/customer-center-modal";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { formatCustomerMoney } from "@/lib/customer-money";
import type { StoreThemeId } from "@/lib/store-themes";

export function OrderCheckoutModal({
  open,
  onClose,
  locale,
  storeTheme = "calm",
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
  storeTheme?: StoreThemeId;
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
    }
  }, [open, initialName, initialPhone]);

  const t =
    locale === "he"
      ? {
          title: "פרטים להשלמת ההזמנה",
          name: "שם",
          phone: "טלפון",
          total: 'סה"כ',
          submit: "אישור הזמנה",
          submitting: "שולח...",
        }
      : {
          title: "Complete your order",
          name: "Name",
          phone: "Phone",
          total: "Total",
          submit: "Confirm order",
          submitting: "Sending...",
        };

  return (
    <CustomerCenterModal
      open={open}
      onClose={onClose}
      title={t.title}
      locale={locale}
      storeTheme={storeTheme}
      bodyClassName="px-5 py-5"
      panelClassName="customer-order-detail-modal-panel max-h-fit"
    >
      <div className="space-y-4 text-center">
        {summary ? (
          <p className="text-[14px] font-semibold leading-snug text-bakery-muted">
            {summary}
          </p>
        ) : null}

        <p className="text-[17px] font-extrabold text-bakery-ink">
          {t.total}: {formatCustomerMoney(total, locale)}
        </p>

        {error ? (
          <p
            role="alert"
            className="rounded-2xl bg-bakery-error/10 px-3 py-2 text-[14px] font-semibold text-bakery-error"
          >
            {error}
          </p>
        ) : null}

        <div className="space-y-3 pt-1">
          <Input
            label={t.name}
            labelClassName="text-center"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-center"
            required
          />
          <Input
            label={t.phone}
            labelClassName="text-center"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-center"
            required
            dir="ltr"
            inputMode="tel"
          />
          <Button
            type="button"
            className="w-full min-h-[48px] font-extrabold"
            disabled={submitting}
            onClick={() => onSubmit(name.trim(), phone.trim())}
          >
            {submitting ? t.submitting : t.submit}
          </Button>
        </div>
      </div>
    </CustomerCenterModal>
  );
}
