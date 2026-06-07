"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, Package } from "lucide-react";
import { Button } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  customerProfileInitial,
  type CustomerProfileInput,
} from "@/components/dashboard/dashboard-customer-profile";

export type DashboardOrderItemView = {
  name: string;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
};

export type DashboardOrderView = {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  statusLabel: string;
  createdAt?: string;
  customerJoinedAt?: string;
  items: DashboardOrderItemView[];
};

const ORDER_STATUS_ACTION_KEYS = [
  { status: "CONFIRMED", key: "confirmOrder" as const },
  { status: "CANCELLED", key: "cancelOrder" as const },
];

function OrderProductThumb({
  name,
  imageUrl,
  quantity,
}: {
  name: string;
  imageUrl: string | null;
  quantity: number;
}) {
  return (
    <div className="relative shrink-0">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name}
          className="h-14 w-14 rounded-[12px] object-cover shadow-sm"
        />
      ) : (
        <span className="flex h-14 w-14 items-center justify-center rounded-[12px] bg-bakery-card shadow-sm">
          <Package className="h-6 w-6 text-bakery-muted" strokeWidth={1.5} />
        </span>
      )}
      <span className="absolute -bottom-1 -end-1 min-w-[1.35rem] rounded-full bg-bakery-primary px-1.5 py-0.5 text-center text-[11px] font-extrabold leading-none text-white shadow-sm">
        ×{quantity}
      </span>
    </div>
  );
}

export function DashboardOrderCard({
  order,
  open,
  onOpenChange,
  onStatusChange,
  onCustomerClick,
  showPrices = false,
}: {
  order: DashboardOrderView;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onStatusChange?: (orderId: string, status: string) => void;
  onCustomerClick?: (input: CustomerProfileInput) => void;
  showPrices?: boolean;
}) {
  const { labels, formatDateTime, formatMoney } = useAppLocale();
  const total = order.items.reduce((s, it) => s + it.lineTotal, 0);
  const createdShort = order.createdAt
    ? formatDateTime(order.createdAt)
    : null;
  const showActions = onStatusChange && order.status === "PENDING";

  return (
    <div className="w-full">
      <div
        className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
          open ? "bakery-float-tile--active" : ""
        }`}
      >
        <button
          type="button"
          onClick={() =>
            onCustomerClick?.({
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              fallbackDate: order.customerJoinedAt ?? order.createdAt,
            })
          }
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-bakery-border/35 bg-bakery-on-primary text-[18px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)] transition hover:opacity-90 active:scale-[0.98]"
          aria-label={`${labels.customer}: ${order.customerName}`}
        >
          {customerProfileInitial(
            order.customerName,
            labels.anonymousCustomer
          )}
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-start"
        >
          <span className="min-w-0 flex-1 truncate text-[16px] font-extrabold leading-tight text-bakery-ink">
            {order.customerName}
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <div className="mt-2 space-y-2.5 rounded-[18px] border border-bakery-border/40 bg-bakery-card/50 p-2.5 text-start shadow-[var(--shadow-bakery-card)]">
          {createdShort && (
            <p className="px-1 text-[12px] font-semibold text-bakery-muted">
              {createdShort}
            </p>
          )}
          <ul className="space-y-2">
            {order.items.map((it, i) => (
              <li
                key={`${order.id}-${i}`}
                className="flex items-center gap-3 rounded-[14px] bg-bakery-input px-2.5 py-2"
              >
                <OrderProductThumb
                  name={it.name}
                  imageUrl={it.imageUrl}
                  quantity={it.quantity}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-extrabold text-bakery-ink">
                    {it.name}
                  </p>
                  <p className="text-[12px] font-semibold text-bakery-muted">
                    {it.quantity}{" "}
                    {it.quantity === 1 ? labels.unit : labels.units}
                  </p>
                </div>
                {showPrices && (
                  <p
                    dir="ltr"
                    className="shrink-0 text-[14px] font-extrabold tabular-nums text-bakery-primary"
                  >
                    {formatMoney(it.lineTotal)}
                  </p>
                )}
              </li>
            ))}
          </ul>

          {showPrices && (
            <div className="flex items-center justify-between gap-2 border-t border-bakery-border/25 pt-2.5">
              <p className="text-[11px] font-bold text-bakery-muted">
                {labels.total}
              </p>
              <p
                dir="ltr"
                className="text-[18px] font-extrabold tabular-nums text-bakery-ink"
              >
                {formatMoney(total)}
              </p>
            </div>
          )}

          {showActions && (
            <div className="grid grid-cols-2 gap-2 border-t border-bakery-border/25 pt-2.5">
              {ORDER_STATUS_ACTION_KEYS.map(({ status, key }) => (
                <Button
                  key={status}
                  variant="primary"
                  className="min-h-[44px] w-full rounded-full font-extrabold"
                  onClick={() => onStatusChange(order.id, status)}
                >
                  {labels[key]}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export function DashboardOrdersSection({
  title,
  orders,
  onStatusChange,
  onCustomerClick,
  customerModal,
  emptyMessage,
}: {
  title: string;
  orders: DashboardOrderView[];
  onStatusChange?: (orderId: string, status: string) => void;
  onCustomerClick?: (input: CustomerProfileInput) => void;
  customerModal?: ReactNode;
  emptyMessage?: string;
}) {
  const { labels } = useAppLocale();
  return (
    <section className="text-center">
      <h2 className="mb-2 w-full text-center text-[18px] font-extrabold text-bakery-ink">
        {title}
      </h2>
      <DashboardOrdersList
        orders={orders}
        onStatusChange={onStatusChange}
        onCustomerClick={onCustomerClick}
        customerModal={customerModal}
        emptyMessage={emptyMessage ?? labels.noOrders}
        emptyCompact
      />
    </section>
  );
}

export function DashboardOrdersList({
  orders,
  onStatusChange,
  onCustomerClick,
  emptyMessage,
  emptyCompact = false,
  showPrices = false,
  customerModal,
}: {
  orders: DashboardOrderView[];
  onStatusChange?: (orderId: string, status: string) => void;
  onCustomerClick?: (input: CustomerProfileInput) => void;
  emptyMessage?: string;
  emptyCompact?: boolean;
  showPrices?: boolean;
  customerModal?: ReactNode;
}) {
  const { labels } = useAppLocale();
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const message = emptyMessage ?? labels.noOrdersYet;

  if (orders.length === 0) {
    return (
      <p
        className={`text-center text-[14px] font-semibold text-bakery-muted ${
          emptyCompact ? "py-3" : "py-8"
        }`}
      >
        {message}
      </p>
    );
  }

  return (
    <>
      <ul className="w-full space-y-2">
        {orders.map((o) => (
          <li key={o.id}>
            <DashboardOrderCard
              order={o}
              open={openOrderId === o.id}
              onOpenChange={(next) => setOpenOrderId(next ? o.id : null)}
              onStatusChange={onStatusChange}
              onCustomerClick={onCustomerClick}
              showPrices={showPrices}
            />
          </li>
        ))}
      </ul>
      {customerModal}
    </>
  );
}
