"use client";

import { formatCustomerMoney } from "@/lib/customer-money";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { CustomerLabels } from "./customer-labels";

type Props = {
  businessName: string;
  description: string | null;
  labels: CustomerLabels;
  locale: CustomerLocale;
  cartItemCount: number;
  cartTotal: number;
  isAppointments: boolean;
  onShop: () => void;
  onOrders: () => void;
  onInquiries: () => void;
};

export function CustomerStoreDashboard({
  businessName,
  description,
  labels,
  locale,
  cartItemCount,
  cartTotal,
  isAppointments,
  onShop,
  onOrders,
  onInquiries,
}: Props) {
  return (
    <div className="space-y-5 pb-2">
      <div>
        <h1 className="text-[22px] font-extrabold leading-tight text-bakery-ink">
          {labels.dashboard}
        </h1>
        <p className="mt-1 text-[15px] font-semibold text-bakery-ink">{businessName}</p>
        {description && (
          <p className="mt-2 text-[14px] leading-snug text-bakery-muted">{description}</p>
        )}
      </div>

      <div className="rounded-[22px] border-[1.2px] border-bakery-border/40 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-sheet p-5 shadow-[var(--shadow-bakery-card)]">
        <p className="text-center text-[14px] font-bold text-bakery-muted">
          {labels.dashboardCartHint}
        </p>
        <p className="mt-2 text-center text-[32px] font-extrabold leading-none text-bakery-ink">
          {cartItemCount}
        </p>
        <p className="mt-1 text-center text-[15px] font-bold text-bakery-muted">
          {labels.dashboardItems}
        </p>
        {!isAppointments && cartTotal > 0 && (
          <p className="mt-3 text-center text-[17px] font-extrabold text-bakery-primary">
            {formatCustomerMoney(cartTotal, locale)}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={onShop}
          className="dashboard-mobile-pill-btn w-full"
        >
          {isAppointments ? labels.appointments : labels.buyNow}
        </button>
        {!isAppointments && (
          <button
            type="button"
            onClick={onOrders}
            className="dashboard-mobile-pill-btn w-full"
          >
            {labels.orders}
            {cartItemCount > 0 && (
              <span className="mt-0.5 block text-[13px] font-bold text-bakery-muted">
                {cartItemCount} {labels.dashboardItems}
              </span>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={onInquiries}
          className="dashboard-mobile-pill-btn w-full"
        >
          {labels.contactSeller}
        </button>
      </div>
    </div>
  );
}
