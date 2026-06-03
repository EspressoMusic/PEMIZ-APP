"use client";

import { useState } from "react";
import { ChevronDown, Package } from "lucide-react";
import { Badge, Button, SquareCard } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

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
  items: DashboardOrderItemView[];
};

const ORDER_STATUS_ACTION_KEYS = [
  { status: "CONFIRMED", key: "confirmOrder" as const },
  { status: "COMPLETED", key: "completeOrder" as const },
  { status: "CANCELLED", key: "cancelOrder" as const },
];

const section =
  "rounded-[16px] bg-bakery-cream-light px-3 py-2.5 text-start";

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
  onStatusChange,
}: {
  order: DashboardOrderView;
  onStatusChange?: (orderId: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { labels, formatDateTime, formatMoney } = useAppLocale();
  const total = order.items.reduce((s, it) => s + it.lineTotal, 0);
  const createdShort = order.createdAt
    ? formatDateTime(order.createdAt)
    : null;
  const createdFull = order.createdAt ? formatDateTime(order.createdAt) : null;
  const showActions =
    onStatusChange &&
    order.status !== "CANCELLED" &&
    order.status !== "COMPLETED";

  return (
    <SquareCard className="bakery-float-tile w-full space-y-2 rounded-[22px] p-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`${section} flex w-full items-center justify-between gap-2 text-start transition active:scale-[0.99]`}
      >
        <p className="min-w-0 flex-1 truncate text-[16px] font-extrabold text-bakery-ink">
          {order.customerName}
        </p>
        <span className="flex shrink-0 items-center gap-1.5">
          {createdShort ? (
            <span className="text-[12px] font-semibold text-bakery-muted">
              {createdShort}
            </span>
          ) : (
            <span className="text-[12px] font-semibold text-bakery-muted">
              {labels.order}
            </span>
          )}
          <ChevronDown
            className={`h-5 w-5 text-bakery-muted transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            strokeWidth={2}
          />
        </span>
      </button>

      {open && (
        <>
          <div className={`${section} flex items-center justify-between gap-2`}>
            <div>
              {createdFull ? (
                <p className="text-[12px] font-semibold text-bakery-muted">
                  {createdFull}
                </p>
              ) : (
                <p className="text-[12px] font-semibold text-bakery-muted">
                  {labels.order}
                </p>
              )}
            </div>
            <Badge>{order.statusLabel}</Badge>
          </div>

          <div className={section}>
            <p className="text-[16px] font-extrabold text-bakery-ink">
              {order.customerName}
            </p>
            <p
              className="mt-0.5 text-[14px] font-semibold text-bakery-ink"
              dir="ltr"
            >
              {order.customerPhone}
            </p>
          </div>

          <div className={section}>
            <ul className="space-y-2.5">
              {order.items.map((it, i) => (
                <li
                  key={`${order.id}-${i}`}
                  className="flex items-center gap-3 rounded-[14px] bg-bakery-cream-sheet px-2.5 py-2"
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
                  <p className="shrink-0 text-[14px] font-extrabold text-bakery-primary">
                    {formatMoney(it.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className={section}>
            <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold text-bakery-muted">{labels.total}</p>
          <p className="text-[18px] font-extrabold text-bakery-ink">
            {formatMoney(total)}
          </p>
            </div>
            {showActions && (
              <div className="mt-3 flex flex-wrap gap-2">
            {ORDER_STATUS_ACTION_KEYS.map(({ status, key }) => (
              <Button
                key={status}
                variant="secondary"
                onClick={() => onStatusChange(order.id, status)}
              >
                {labels[key]}
              </Button>
            ))}
              </div>
            )}
          </div>
        </>
      )}
    </SquareCard>
  );
}

export function DashboardOrdersSection({
  title,
  orders,
  onStatusChange,
  emptyMessage,
}: {
  title: string;
  orders: DashboardOrderView[];
  onStatusChange?: (orderId: string, status: string) => void;
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
        emptyMessage={emptyMessage ?? labels.noOrders}
        emptyCompact
      />
    </section>
  );
}

export function DashboardOrdersList({
  orders,
  onStatusChange,
  emptyMessage,
  emptyCompact = false,
}: {
  orders: DashboardOrderView[];
  onStatusChange?: (orderId: string, status: string) => void;
  emptyMessage?: string;
  emptyCompact?: boolean;
}) {
  const { labels } = useAppLocale();
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
    <ul className="w-full space-y-3">
      {orders.map((o) => (
        <li key={o.id}>
          <DashboardOrderCard order={o} onStatusChange={onStatusChange} />
        </li>
      ))}
    </ul>
  );
}
