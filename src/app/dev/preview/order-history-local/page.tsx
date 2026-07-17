"use client";

import { Button } from "@/components/ui";
import { getCustomerLabels } from "@/components/customer/customer-labels";
import { formatCustomerOrderDate } from "@/lib/customer-order-history";
import {
  customerOrderStatusLabel,
  customerOrderStatusToneClass,
} from "@/lib/order-status-label";

const MOCK_ORDERS = ["PENDING", "CONFIRMED", "COMPLETED", "REJECTED", "CANCELLED"].map(
  (status, i) => ({
    id: String(i + 1),
    placedAt: new Date(Date.now() - i * 86_400_000).toISOString(),
    orderNumber: 101 - i,
    status,
  })
);

export default function DevOrderHistoryLocalPreviewPage() {
  const labels = getCustomerLabels("he");

  return (
    <div className="bakery-frame-bg flex min-h-dvh items-center justify-center p-4">
      <div className="customer-store-root customer-theme-turquoise w-full max-w-sm rounded-[24px] bg-bakery-cream-light p-4 shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
        <h2 className="mb-3 text-center text-[16px] font-extrabold text-bakery-ink">
          {labels.orderHistory}
        </h2>
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-center text-[12px] font-bold text-bakery-muted">
              {labels.orderHistoryOnThisDevice}
            </p>
            <ul className="space-y-2">
              {MOCK_ORDERS.map((order) => (
                <li
                  key={order.id}
                  className="w-full rounded-[18px] border-[2px] border-bakery-primary bg-bakery-square px-3 py-3 text-start"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-bold text-bakery-muted">
                      {formatCustomerOrderDate(order.placedAt, "he")}
                    </span>
                    <span
                      className={`text-[13px] font-extrabold ${customerOrderStatusToneClass(order.status)}`}
                    >
                      {customerOrderStatusLabel(order.status, "he")}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-bakery-muted">
                    {labels.orderNumber} #{order.orderNumber}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-center text-[12px] font-semibold text-bakery-muted">
              {labels.orderHistorySignInForDetails}
            </p>
          </div>
          <Button type="button" variant="secondary" className="w-full">
            {labels.googleSignInForHistory}
          </Button>
        </div>
      </div>
    </div>
  );
}
