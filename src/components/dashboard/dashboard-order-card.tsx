"use client";

import { useState, type ReactNode } from "react";
import { Check, Package, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  customerProfileInitial,
  type CustomerProfileInput,
} from "@/components/dashboard/dashboard-customer-profile";
import {
  DASHBOARD_PRESSABLE_CLASS,
  getDashboardPressProps,
  useDashboardLongPress,
} from "@/lib/dashboard-press";

export type DashboardOrderItemView = {
  name: string;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
};

export type DashboardOrderView = {
  id: string;
  orderNumber?: number;
  customerName: string;
  customerPhone: string;
  status: string;
  statusLabel: string;
  createdAt?: string;
  customerJoinedAt?: string;
  customerAddress?: string | null;
  customerAddressLat?: number | null;
  customerAddressLng?: number | null;
  sellerHiddenAt?: string | null;
  items: DashboardOrderItemView[];
};

function googleMapsUrl(order: DashboardOrderView): string {
  if (order.customerAddressLat != null && order.customerAddressLng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${order.customerAddressLat},${order.customerAddressLng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    order.customerAddress ?? ""
  )}`;
}

function wazeUrl(order: DashboardOrderView): string {
  if (order.customerAddressLat != null && order.customerAddressLng != null) {
    return `https://waze.com/ul?ll=${order.customerAddressLat},${order.customerAddressLng}&navigate=yes`;
  }
  return `https://waze.com/ul?q=${encodeURIComponent(
    order.customerAddress ?? ""
  )}&navigate=yes`;
}

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

export function DashboardOrderDetails({
  order,
  total,
  showPrices,
  onClose,
  onConfirm,
  onReject,
}: {
  order: DashboardOrderView;
  total: number;
  showPrices: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onReject?: () => void;
}) {
  const { labels, formatMoney } = useAppLocale();
  const [confirmingReject, setConfirmingReject] = useState(false);
  const isPending = order.status === "PENDING";

  return (
    <div className="space-y-2.5 text-start">
      {order.orderNumber != null ? (
        <p className="text-center text-[13px] font-bold text-bakery-muted">
          {labels.orderNumber} #{order.orderNumber}
        </p>
      ) : null}
      <div className="flex items-center gap-3 rounded-[16px] border border-bakery-border/30 bg-bakery-cream-light/90 px-3 py-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-bakery-border/35 bg-bakery-on-primary text-[16px] font-extrabold text-bakery-primary">
          {customerProfileInitial(
            order.customerName,
            labels.anonymousCustomer
          )}
        </span>
        <p className="min-w-0 flex-1 truncate text-[16px] font-extrabold text-bakery-ink">
          {order.customerName}
        </p>
      </div>

      {order.customerAddress ? (
        <div className="space-y-2 rounded-[14px] border border-bakery-border/30 bg-bakery-cream-light/90 px-3 py-2.5 text-start">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-bakery-primary" strokeWidth={2} />
            <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-bakery-ink">
              {order.customerAddress}
            </span>
          </div>
          <div className="flex gap-2">
            <a
              href={wazeUrl(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-full border border-bakery-border/40 bg-bakery-on-primary py-1.5 text-center text-[12px] font-extrabold text-bakery-ink transition hover:opacity-90"
            >
              {labels.openInWaze}
            </a>
            <a
              href={googleMapsUrl(order)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-full border border-bakery-border/40 bg-bakery-on-primary py-1.5 text-center text-[12px] font-extrabold text-bakery-ink transition hover:opacity-90"
            >
              {labels.openInMaps}
            </a>
          </div>
        </div>
      ) : null}

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

      <div className="border-t border-bakery-border/25 pt-2.5">
        {isPending && (onConfirm || onReject) ? (
          confirmingReject ? (
            <div className="space-y-2">
              <p className="text-center text-[13px] font-semibold text-bakery-ink">
                {labels.rejectOrderConfirmBody}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="min-h-[38px] flex-1 rounded-full px-3 py-2 text-[15px] font-extrabold"
                  onClick={() => setConfirmingReject(false)}
                >
                  {labels.cancel}
                </Button>
                <Button
                  variant="danger"
                  className="min-h-[38px] flex-1 rounded-full px-3 py-2 text-[15px] font-extrabold"
                  onClick={() => {
                    onReject?.();
                    onClose();
                  }}
                >
                  {labels.rejectOrderButton}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="danger"
                className="flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[15px] font-extrabold"
                onClick={() => setConfirmingReject(true)}
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
                {labels.rejectOrderButton}
              </Button>
              <Button
                variant="primary"
                className="flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[15px] font-extrabold"
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
              >
                <Check className="h-4 w-4" strokeWidth={2.5} />
                {labels.confirmOrderButton}
              </Button>
            </div>
          )
        ) : (
          <Button
            variant="primary"
            className="min-h-[38px] w-full rounded-full px-3 py-2 text-[16px] font-extrabold"
            onClick={onClose}
          >
            {labels.ok}
          </Button>
        )}
      </div>
    </div>
  );
}

export function DashboardOrderCard({
  order,
  open,
  onOpenChange,
  onCustomerClick,
  onConfirmOrder,
  onRejectOrder,
  onToggleComplete,
  showPrices = false,
  selectionMode = false,
  selected = false,
  onToggleSelect,
  onLongPress,
}: {
  order: DashboardOrderView;
  open: boolean;
  onOpenChange: (next: boolean) => void;
  onCustomerClick?: (input: CustomerProfileInput) => void;
  onConfirmOrder?: (orderId: string) => void;
  onRejectOrder?: (orderId: string) => void;
  onToggleComplete?: (orderId: string) => void;
  showPrices?: boolean;
  /** Multi-select mode is active for the whole list (entered via long-press). */
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onLongPress?: () => void;
}) {
  const { labels, formatDateTime } = useAppLocale();
  const total = order.items.reduce((s, it) => s + it.lineTotal, 0);
  const createdShort = order.createdAt
    ? formatDateTime(order.createdAt)
    : null;
  const isCompleted = order.status === "COMPLETED";
  const isRejected = order.status === "REJECTED";
  const pressProps = getDashboardPressProps<HTMLDivElement>();
  const longPress = useDashboardLongPress<HTMLDivElement>(
    () => onLongPress?.(),
    500
  );

  function handleRowActivate() {
    if (longPress.consumeLongPress()) return;
    if (selectionMode) {
      onToggleSelect?.();
      return;
    }
    onOpenChange(true);
  }

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={handleRowActivate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleRowActivate();
          }
        }}
        onPointerDown={(e) => {
          pressProps.onPointerDown(e);
          if (onLongPress) longPress.onPointerDown(e);
        }}
        onPointerUp={(e) => {
          pressProps.onPointerUp(e);
          if (onLongPress) longPress.onPointerUp();
        }}
        onPointerLeave={(e) => {
          pressProps.onPointerLeave(e);
          if (onLongPress) longPress.onPointerLeave();
        }}
        onPointerCancel={(e) => {
          pressProps.onPointerCancel(e);
          if (onLongPress) longPress.onPointerCancel();
        }}
        onPointerMove={onLongPress ? longPress.onPointerMove : undefined}
        className={`${DASHBOARD_PRESSABLE_CLASS} dashboard-action-square dashboard-order-row flex w-full cursor-pointer items-center gap-3 rounded-[22px] px-3 py-3.5 text-start ${
          isCompleted || isRejected ? "opacity-60" : ""
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (selectionMode) return;
            onCustomerClick?.({
              customerName: order.customerName,
              customerPhone: order.customerPhone,
              fallbackDate: order.customerJoinedAt ?? order.createdAt,
            });
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-bakery-border/35 bg-bakery-on-primary text-[18px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)] transition hover:opacity-90 active:scale-[0.98]"
          aria-label={`${labels.customer}: ${order.customerName}`}
        >
          {customerProfileInitial(
            order.customerName,
            labels.anonymousCustomer
          )}
        </button>
        <span className="min-w-0 flex-1 truncate text-[16px] font-extrabold leading-tight text-bakery-ink">
          {order.customerName}
        </span>
        {selectionMode ? (
          <span
            aria-hidden
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
              selected
                ? "border-bakery-primary bg-bakery-primary text-bakery-on-primary"
                : "border-bakery-border/40 bg-bakery-card"
            }`}
          >
            {selected ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
          </span>
        ) : onToggleComplete && !isRejected ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(order.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={isCompleted ? labels.undoCompleteOrder : labels.completeOrder}
            aria-pressed={isCompleted}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition active:scale-[0.95] ${
              isCompleted
                ? "border-bakery-primary bg-bakery-primary text-bakery-on-primary"
                : "border-bakery-border/40 bg-bakery-card text-bakery-muted hover:border-bakery-primary/50"
            }`}
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </button>
        ) : null}
      </div>

      <DashboardActionSheet
        open={open}
        onClose={() => onOpenChange(false)}
        ariaLabel={order.customerName}
        placement="center"
        showBackButton
        compact
        fitContent
        warmPanel
        headerNote={createdShort ?? undefined}
        panelClassName="dashboard-order-schedule-sheet"
      >
        <DashboardOrderDetails
          order={order}
          total={total}
          showPrices={showPrices}
          onClose={() => onOpenChange(false)}
          onConfirm={
            onConfirmOrder && order.status === "PENDING"
              ? () => onConfirmOrder(order.id)
              : undefined
          }
          onReject={
            onRejectOrder && order.status === "PENDING"
              ? () => onRejectOrder(order.id)
              : undefined
          }
        />
      </DashboardActionSheet>
    </div>
  );
}

export function DashboardOrdersSection({
  title,
  orders,
  onCustomerClick,
  onConfirmOrder,
  onRejectOrder,
  onToggleComplete,
  onHideOrders,
  customerModal,
  emptyMessage,
}: {
  title: string;
  orders: DashboardOrderView[];
  onCustomerClick?: (input: CustomerProfileInput) => void;
  onConfirmOrder?: (orderId: string) => void;
  onRejectOrder?: (orderId: string) => void;
  onToggleComplete?: (orderId: string) => void;
  onHideOrders?: (orderIds: string[]) => void | Promise<void>;
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
        onCustomerClick={onCustomerClick}
        onConfirmOrder={onConfirmOrder}
        onRejectOrder={onRejectOrder}
        onToggleComplete={onToggleComplete}
        onHideOrders={onHideOrders}
        customerModal={customerModal}
        emptyMessage={emptyMessage ?? labels.noOrders}
        emptyCompact
      />
    </section>
  );
}

export function DashboardOrdersList({
  orders,
  onCustomerClick,
  onConfirmOrder,
  onRejectOrder,
  onToggleComplete,
  onHideOrders,
  emptyMessage,
  emptyCompact = false,
  showPrices = false,
  customerModal,
}: {
  orders: DashboardOrderView[];
  onCustomerClick?: (input: CustomerProfileInput) => void;
  onConfirmOrder?: (orderId: string) => void;
  onRejectOrder?: (orderId: string) => void;
  onToggleComplete?: (orderId: string) => void;
  /** Enables long-press multi-select + bulk "delete from window" when provided. */
  onHideOrders?: (orderIds: string[]) => void | Promise<void>;
  emptyMessage?: string;
  emptyCompact?: boolean;
  showPrices?: boolean;
  customerModal?: ReactNode;
}) {
  const { labels } = useAppLocale();
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const message = emptyMessage ?? labels.noOrdersYet;
  const selectionMode = selectedIds.size > 0;

  function toggleSelect(orderId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  }

  function cancelSelection() {
    setSelectedIds(new Set());
  }

  async function confirmDelete() {
    setDeleting(true);
    await onHideOrders?.(Array.from(selectedIds));
    setDeleting(false);
    setConfirmDeleteOpen(false);
    setSelectedIds(new Set());
  }

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
              onCustomerClick={onCustomerClick}
              onConfirmOrder={onConfirmOrder}
              onRejectOrder={onRejectOrder}
              onToggleComplete={onToggleComplete}
              showPrices={showPrices}
              selectionMode={selectionMode}
              selected={selectedIds.has(o.id)}
              onToggleSelect={() => toggleSelect(o.id)}
              onLongPress={onHideOrders ? () => setSelectedIds(new Set([o.id])) : undefined}
            />
          </li>
        ))}
      </ul>
      {customerModal}
      {selectionMode ? (
        <div className="sticky bottom-0 mt-2 flex items-center justify-between gap-2 rounded-[16px] border border-bakery-border/40 bg-bakery-card px-3 py-2 shadow-[var(--shadow-bakery-card)]">
          <button
            type="button"
            onClick={cancelSelection}
            className="min-h-[36px] rounded-full px-3 text-[13px] font-extrabold text-bakery-ink transition active:opacity-80"
          >
            {labels.cancel}
          </button>
          <span className="text-[13px] font-bold text-bakery-muted">
            {labels.ordersSelectedCount.replace("{count}", String(selectedIds.size))}
          </span>
          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            className="min-h-[36px] rounded-full border border-bakery-error/45 bg-bakery-error/10 px-3 text-[13px] font-extrabold text-bakery-error transition active:opacity-80"
          >
            {labels.deleteSelectedOrders}
          </button>
        </div>
      ) : null}
      <DashboardActionSheet
        open={confirmDeleteOpen}
        onClose={() => !deleting && setConfirmDeleteOpen(false)}
        title={labels.deleteOrdersModalTitle}
        ariaLabel={labels.deleteOrdersModalTitle}
        placement="center"
        expanded={false}
        fitContent
        panelClassName="w-full max-w-md"
      >
        <div className="space-y-6 px-2 py-2 text-center">
          <p className="text-[15px] font-semibold leading-relaxed text-bakery-ink">
            {labels.deleteOrdersModalBody}
          </p>
          <div className="flex flex-row items-stretch justify-center gap-3">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setConfirmDeleteOpen(false)}
              className="min-h-[48px] min-w-[7.5rem] rounded-xl border-2 border-bakery-border bg-bakery-card px-4 text-[15px] font-extrabold text-bakery-ink transition hover:bg-bakery-surface active:opacity-80 disabled:opacity-50"
            >
              {labels.cancel}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void confirmDelete()}
              className="min-h-[48px] min-w-[7.5rem] rounded-xl border-2 border-bakery-error/45 bg-bakery-card px-4 text-[15px] font-extrabold text-bakery-error transition hover:bg-bakery-error/10 active:opacity-80 disabled:opacity-50"
            >
              {deleting ? labels.deleting : labels.deleteOrdersModalConfirm}
            </button>
          </div>
        </div>
      </DashboardActionSheet>
    </>
  );
}
