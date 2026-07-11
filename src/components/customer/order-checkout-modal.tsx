"use client";

import { useEffect, useState } from "react";
import { Button, Input, Toggle } from "@/components/ui";
import { CustomerCenterModal } from "@/components/customer/customer-center-modal";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { formatCustomerMoney } from "@/lib/customer-money";
import type { StoreThemeId } from "@/lib/store-themes";
import { isValidPhone } from "@/lib/phone";

export function OrderCheckoutModal({
  open,
  onClose,
  locale,
  storeTheme = "turquoise",
  total,
  initialName,
  initialPhone,
  showCoupon = false,
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
  showCoupon?: boolean;
  onSubmit: (name: string, phone: string, couponCode?: string) => void;
  submitting: boolean;
  error?: string;
  summary?: string;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [couponEnabled, setCouponEnabled] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    if (open) {
      setName(initialName);
      setPhone(initialPhone);
      setCouponEnabled(false);
      setCouponCode("");
      setLocalError("");
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
          invalidPhone: "יש להזין מספר נייד ישראלי תקין (למשל 050-1234567)",
          nameRequired: "יש למלא שם",
          couponToggle: "קופון",
          couponCode: "קוד קופון",
        }
      : {
          title: "Complete your order",
          name: "Name",
          phone: "Phone",
          total: "Total",
          submit: "Confirm order",
          submitting: "Sending...",
          invalidPhone: "Enter a valid Israeli mobile number (e.g. 050-1234567)",
          nameRequired: "Please enter your name",
          couponToggle: "Coupon",
          couponCode: "Coupon code",
        };

  const displayError = error || localError;

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

        <div className="mx-auto w-fit rounded-[14px] border border-bakery-border/35 bg-bakery-card px-4 py-3.5 text-center shadow-[0_2px_8px_rgba(58,47,38,0.08)]">
          <p className="text-[17px] font-extrabold tabular-nums text-bakery-ink">
            {t.total}: {formatCustomerMoney(total, locale)}
          </p>
        </div>

        {displayError ? (
          <p
            role="alert"
            className="rounded-2xl bg-bakery-error/10 px-3 py-2 text-[14px] font-semibold text-bakery-error"
          >
            {displayError}
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
          {showCoupon ? (
            <div className="flex items-stretch gap-2">
              <div className="flex shrink-0 items-center gap-2 rounded-[12px] border border-bakery-border/35 bg-bakery-input/80 px-2.5 py-2">
                <span className="text-[12px] font-bold leading-tight text-bakery-ink">
                  {t.couponToggle}
                </span>
                <Toggle
                  enabled={couponEnabled}
                  onChange={(next) => {
                    setCouponEnabled(next);
                    if (!next) setCouponCode("");
                  }}
                  ariaLabel={t.couponToggle}
                />
              </div>
              {couponEnabled ? (
                <div className="min-w-0 flex-1">
                  <Input
                    aria-label={t.couponCode}
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="text-center"
                    dir="ltr"
                    autoFocus
                  />
                </div>
              ) : null}
            </div>
          ) : null}
          <Button
            type="button"
            className="w-full min-h-[48px] font-extrabold"
            disabled={submitting}
            onClick={() => {
              const trimmedName = name.trim();
              const trimmedPhone = phone.trim();
              if (trimmedName.length < 2) {
                setLocalError(t.nameRequired);
                return;
              }
              if (!isValidPhone(trimmedPhone)) {
                setLocalError(t.invalidPhone);
                return;
              }
              setLocalError("");
              onSubmit(trimmedName, trimmedPhone, couponCode.trim() || undefined);
            }}
          >
            {submitting ? t.submitting : t.submit}
          </Button>
        </div>
      </div>
    </CustomerCenterModal>
  );
}
