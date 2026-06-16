"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Package, X } from "lucide-react";
import { Button } from "@/components/ui";
import {
  customerProfileInitial,
  useDashboardCustomerProfile,
  type CustomerProfileInput,
} from "@/components/dashboard/dashboard-customer-profile";
import {
  DashboardOrdersList,
  type DashboardOrderView,
} from "@/components/dashboard/dashboard-order-card";
import {
  groupPrepLinesByCustomer,
  mapPendingOrdersFromRecords,
  type PendingOrderRecord,
  type PrepProductSummary,
} from "@/lib/dashboard-prep-summary";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import type { DashboardLabels } from "@/lib/dashboard-messages";

function ProductThumb({
  name,
  imageUrl,
  compact = false,
}: {
  name: string;
  imageUrl: string | null;
  compact?: boolean;
}) {
  const size = compact ? "h-10 w-10 rounded-[10px]" : "h-16 w-16 rounded-[14px] sm:h-20 sm:w-20";
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className={`dashboard-prep-product-img ${size} object-cover shadow-sm`}
      />
    );
  }
  return (
    <span
      className={`dashboard-prep-product-placeholder flex items-center justify-center shadow-sm ${size}`}
    >
      <Package
        className={compact ? "h-5 w-5 text-bakery-ink" : "h-8 w-8 text-bakery-ink"}
        strokeWidth={2}
      />
    </span>
  );
}

function orderStatusLabel(
  status: string,
  labels: DashboardLabels
): string {
  const map: Record<string, string> = {
    PENDING: labels.pending,
    CONFIRMED: labels.confirmed,
    COMPLETED: labels.completed,
    CANCELLED: labels.cancelled,
  };
  return map[status] ?? status;
}

function PrepDetailModal({
  product,
  onClose,
  onCustomerClick,
  labels,
  anonymousLabel,
}: {
  product: PrepProductSummary;
  onClose: () => void;
  onCustomerClick?: (input: CustomerProfileInput) => void;
  labels: DashboardLabels;
  anonymousLabel: string;
}) {
  const customers = groupPrepLinesByCustomer(product.orders);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${product.name}`}
    >
      <button
        type="button"
        className="dashboard-modal-backdrop absolute inset-0"
        onClick={onClose}
        aria-label={labels.close}
      />
      <div className="dashboard-modal-card relative max-h-[85dvh] w-full max-w-md overflow-hidden">
        <div className="dashboard-modal-header-band flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <ProductThumb name={product.name} imageUrl={product.imageUrl} />
            <div className="text-start">
              <p className="text-[18px] font-extrabold text-bakery-ink">
                {product.name}
              </p>
              <p className="text-[14px] font-bold text-bakery-primary">
                {labels.total}: {product.totalQuantity}
              </p>
              <p className="text-[12px] font-semibold text-bakery-muted">
                {customers.length}{" "}
                {customers.length === 1 ? labels.customer : labels.customers}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-bakery-muted hover:bg-bakery-primary/10"
            aria-label={labels.close}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {customers.length === 0 ? (
          <p className="px-4 py-8 text-center text-[14px] text-bakery-muted">
            {labels.noOrders}
          </p>
        ) : (
          <ul className="max-h-[60dvh] space-y-3 overflow-y-auto px-4 py-4">
            {customers.map((customer) => (
              <li
                key={`${customer.customerPhone}-${customer.customerName}`}
                className="rounded-[18px] border border-bakery-border/25 bg-bakery-cream-light p-3 text-start"
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      onCustomerClick?.({
                        customerName: customer.customerName,
                        customerPhone: customer.customerPhone,
                      })
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-bakery-border/35 bg-bakery-on-primary text-[16px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)] transition hover:opacity-90 active:scale-[0.98]"
                    aria-label={`${labels.customer}: ${customer.customerName}`}
                  >
                    {customerProfileInitial(
                      customer.customerName,
                      anonymousLabel
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-extrabold text-bakery-ink">
                      {customer.customerName}
                    </p>
                    <p className="mt-0.5 text-[15px] font-bold text-bakery-primary">
                      {customer.totalQuantity}{" "}
                      {customer.totalQuantity === 1 ? labels.unit : labels.units}
                      {customer.orderCount > 1 &&
                        ` · ${customer.orderCount} ${labels.orders}`}
                    </p>
                    <p
                      className="mt-1 text-[14px] font-semibold text-bakery-muted"
                      dir="ltr"
                    >
                      {customer.customerPhone}
                    </p>
                    {customer.customerEmail && (
                      <a
                        href={`mailto:${customer.customerEmail}`}
                        className="block text-[13px] text-bakery-muted hover:text-bakery-ink"
                        dir="ltr"
                      >
                        {customer.customerEmail}
                      </a>
                    )}
                    {customer.notes.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {customer.notes.map((note) => (
                          <p
                            key={note}
                            className="text-[13px] leading-snug text-bakery-ink"
                          >
                            {labels.description}: {note}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function DashboardPrepSummary({
  initialProducts,
  initialOrders,
  initialPendingOrders,
  loadFromApi = false,
  previewOnly = false,
  inquiryBell,
}: {
  initialProducts: PrepProductSummary[];
  initialOrders?: DashboardOrderView[];
  initialPendingOrders?: PendingOrderRecord[];
  loadFromApi?: boolean;
  previewOnly?: boolean;
  inquiryBell?: ReactNode;
}) {
  const { labels, locale } = useAppLocale();
  const { openCustomer, modal: customerModal } = useDashboardCustomerProfile({
    previewOnly,
    previewOrders: initialOrders,
  });
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState<DashboardOrderView[]>(() => {
    if (initialOrders) return initialOrders;
    if (initialPendingOrders) {
      return mapPendingOrdersFromRecords(initialPendingOrders, locale);
    }
    return [];
  });
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PrepProductSummary | null>(
    null
  );

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    if (initialOrders) {
      setOrders(initialOrders);
      return;
    }
    if (initialPendingOrders) {
      setOrders(mapPendingOrdersFromRecords(initialPendingOrders, locale));
    }
  }, [initialOrders, initialPendingOrders, locale]);

  const refresh = useCallback(async () => {
    const [ordersRes, prepRes] = await Promise.all([
      fetch("/api/dashboard/orders"),
      fetch("/api/dashboard/prep-summary"),
    ]);
    const ordersData = await ordersRes.json().catch(() => ({}));
    const prepData = await prepRes.json().catch(() => ({}));
    if (prepRes.ok && prepData.products) {
      setProducts(prepData.products as PrepProductSummary[]);
    }
    if (ordersRes.ok && ordersData.orders) {
      const mapped = mapPendingOrdersFromRecords(
        ordersData.orders.filter(
          (o: { status: string }) => o.status === "PENDING"
        ),
        locale
      );
      setOrders(mapped);
    }
  }, [locale]);

  useEffect(() => {
    if (!loadFromApi) return;
    void refresh();
  }, [loadFromApi, refresh]);

  async function setOrderStatus(orderId: string, status: string) {
    if (previewOnly) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status,
                statusLabel: orderStatusLabel(status, labels),
              }
            : o
        )
      );
      return;
    }
    await fetch("/api/dashboard/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    await refresh();
  }

  const grandTotal = products.reduce((s, p) => s + p.totalQuantity, 0);

  return (
    <div className="flex h-full min-h-0 max-h-full w-full flex-col text-center">
      <div className="dashboard-card bakery-float-panel relative flex h-full min-h-0 max-h-full flex-1 flex-col overflow-hidden rounded-[32px] p-0">
        {inquiryBell ? (
          <div className="absolute end-3 top-3 z-10">{inquiryBell}</div>
        ) : null}
        {orders.length === 0 ? (
          <div
            className={`flex flex-1 flex-col items-center justify-center px-4 py-8 ${
              inquiryBell ? "pt-14" : ""
            }`}
          >
            <Package
              className="h-12 w-12 text-bakery-ink/70"
              strokeWidth={1.75}
            />
            <p className="mt-3 text-[14px] font-semibold text-bakery-muted">
              {labels.noActiveOrders}
            </p>
          </div>
        ) : (
          <div
            className={`no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2.5 sm:px-4 ${
              inquiryBell ? "pt-14" : ""
            }`}
          >
            <DashboardOrdersList
              orders={orders}
              onStatusChange={setOrderStatus}
              onCustomerClick={openCustomer}
              showPrices
            />
          </div>
        )}

        {products.length > 0 ? (
          <div className="shrink-0 border-t border-bakery-border/20 px-3 py-2.5 sm:px-4">
            <Button
              type="button"
              variant="primary"
              className="w-full min-h-[44px] rounded-full font-extrabold"
              onClick={() => setSummaryOpen(true)}
            >
              {labels.prepSummaryButton}
            </Button>
          </div>
        ) : null}
      </div>

      <DashboardActionSheet
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        title={labels.prepSummaryButton}
        ariaLabel={labels.prepSummaryButton}
        placement="center"
        showBackButton
        compact
        fitContent
        warmPanel
        panelClassName="dashboard-order-schedule-sheet"
      >
        <div className="space-y-2.5 text-start">
          <ul className="space-y-2">
            {products.map((p) => (
              <li key={p.productId}>
                <button
                  type="button"
                  onClick={() => {
                    setSummaryOpen(false);
                    setSelectedProduct(p);
                  }}
                  className="flex w-full items-center gap-3 rounded-[14px] border border-bakery-border/30 bg-bakery-cream-light/90 px-2.5 py-2 text-start transition hover:bg-bakery-card active:scale-[0.99]"
                >
                  <ProductThumb
                    name={p.name}
                    imageUrl={p.imageUrl}
                    compact
                  />
                  <span className="min-w-0 flex-1 truncate text-[14px] font-extrabold text-bakery-ink">
                    {p.name}
                  </span>
                  <span className="shrink-0 text-[16px] font-extrabold tabular-nums text-bakery-primary">
                    ×{p.totalQuantity}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="rounded-[14px] border border-bakery-primary/25 bg-bakery-primary/10 px-3 py-2.5 text-center">
            <p className="text-[12px] font-bold text-bakery-muted">
              {labels.total}
            </p>
            <p className="text-[22px] font-extrabold leading-none text-bakery-primary">
              {grandTotal}
              <span className="ms-1 text-[14px] font-bold text-bakery-ink">
                {labels.units}
              </span>
            </p>
          </div>
        </div>
      </DashboardActionSheet>

      {selectedProduct && (
        <PrepDetailModal
          product={selectedProduct}
          labels={labels}
          anonymousLabel={labels.anonymousCustomer}
          onCustomerClick={openCustomer}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {customerModal}
    </div>
  );
}
