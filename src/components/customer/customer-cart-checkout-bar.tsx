"use client";

import { formatCustomerMoney } from "@/lib/customer-money";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { CustomerLabels } from "./customer-labels";

export function CustomerCartCheckoutBar({
  labels,
  locale,
  total,
  itemCount,
  phoneColumn = false,
  onComplete,
  onClear,
}: {
  labels: CustomerLabels;
  locale: CustomerLocale;
  total: number;
  itemCount: number;
  phoneColumn?: boolean;
  onComplete: () => void;
  onClear: () => void;
}) {
  return (
    <div
      className={
        phoneColumn
          ? "customer-cart-checkout-bar pointer-events-auto relative z-40 w-full shrink-0 border-t border-bakery-border/30 bg-bakery-card/98 shadow-[0_-4px_16px_rgba(58,47,38,0.08)] backdrop-blur-sm"
          : "customer-cart-checkout-bar pointer-events-auto fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-bakery-border/30 bg-bakery-card/98 shadow-[0_-4px_16px_rgba(58,47,38,0.08)] backdrop-blur-sm"
      }
    >
      <div
        className={`px-3 py-2.5 ${phoneColumn ? "" : "mx-auto max-w-[360px]"}`}
      >
        <button
          type="button"
          onClick={onComplete}
          className="flex w-full min-h-[48px] items-center justify-between gap-3 rounded-[16px] bg-bakery-primary px-4 py-3 text-bakery-on-primary shadow-[var(--shadow-bakery-btn)] transition hover:opacity-95 active:scale-[0.99]"
        >
          <span className="text-[16px] font-extrabold">
            {labels.completeOrder}
            {itemCount > 0 ? (
              <span className="ms-1.5 text-[14px] font-bold opacity-90">
                ({itemCount})
              </span>
            ) : null}
          </span>
          <span className="text-[17px] font-extrabold tabular-nums">
            {formatCustomerMoney(total, locale)}
          </span>
        </button>
        <button
          type="button"
          onClick={onClear}
          className="mt-1.5 w-full py-1 text-center text-[13px] font-bold text-bakery-muted transition hover:text-bakery-ink"
        >
          {labels.cancelOrder}
        </button>
      </div>
    </div>
  );
}
