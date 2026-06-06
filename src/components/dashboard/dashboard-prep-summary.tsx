"use client";

import { useCallback, useEffect, useState } from "react";
import { Package, X } from "lucide-react";
import {
  customerProfileInitial,
  useDashboardCustomerProfile,
  type CustomerProfileInput,
} from "@/components/dashboard/dashboard-customer-profile";
import {
  groupPrepLinesByCustomer,
  type PrepProductSummary,
} from "@/lib/dashboard-prep-summary";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
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
  loadFromApi = false,
  compact = false,
  fillHeight = false,
}: {
  initialProducts: PrepProductSummary[];
  loadFromApi?: boolean;
  compact?: boolean;
  /** דף בית — ממלא גובה עם ריבועים גדולים */
  fillHeight?: boolean;
}) {
  const { labels } = useAppLocale();
  const { openCustomer, modal: customerModal } = useDashboardCustomerProfile();
  const spread = fillHeight && !compact;
  const [products, setProducts] = useState(initialProducts);
  const [selected, setSelected] = useState<PrepProductSummary | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const refreshProducts = useCallback(async () => {
    const res = await fetch("/api/dashboard/prep-summary");
    const data = await res.json();
    if (res.ok && data.products) {
      setProducts(data.products);
      return data.products as PrepProductSummary[];
    }
    return null;
  }, []);

  useEffect(() => {
    if (!loadFromApi) return;
    void refreshProducts();
  }, [loadFromApi, refreshProducts]);

  useEffect(() => {
    if (!selected) return;
    const updated = products.find((p) => p.productId === selected.productId);
    if (updated) setSelected(updated);
  }, [products, selected?.productId]);

  async function openProductDetail(product: PrepProductSummary) {
    setLoadingDetail(true);
    try {
      if (loadFromApi) {
        const list = await refreshProducts();
        const fresh = list?.find((p) => p.productId === product.productId);
        setSelected(fresh ?? product);
      } else {
        setSelected(product);
      }
    } finally {
      setLoadingDetail(false);
    }
  }

  const grandTotal = products.reduce((s, p) => s + p.totalQuantity, 0);

  const productTiles = products.map((p) => (
    <button
      key={p.productId}
      type="button"
      disabled={loadingDetail}
      onClick={() => void openProductDetail(p)}
      className={`dashboard-prep-product-tile flex flex-col items-center justify-center transition active:scale-[0.98] disabled:opacity-60 ${
        spread
          ? "min-h-[5.5rem] gap-2 rounded-[20px] p-3 sm:min-h-[6.5rem]"
          : compact
            ? "gap-1 rounded-[16px] px-2 py-2"
            : "aspect-square gap-2 rounded-[20px] p-3"
      }`}
    >
      <ProductThumb
        name={p.name}
        imageUrl={p.imageUrl}
        compact={compact && !spread}
      />
      <span
        className={`line-clamp-2 font-extrabold leading-tight text-bakery-ink ${
          compact && !spread ? "text-[10px]" : "text-[12px] sm:text-[13px]"
        }`}
      >
        {p.name}
      </span>
      <span
        className={`font-extrabold leading-none text-bakery-primary ${
          compact && !spread ? "text-[16px]" : "text-[22px]"
        }`}
      >
        ×{p.totalQuantity}
      </span>
    </button>
  ));

  return (
    <div
      className={`w-full text-center ${
        compact || spread ? "flex h-full min-h-0 max-h-full flex-col" : ""
      }`}
    >
      <div
        className={`dashboard-card bakery-float-panel rounded-[32px] ${
          spread || compact
            ? "flex h-full min-h-0 max-h-full flex-1 flex-col overflow-hidden p-0"
            : "p-0"
        } ${!spread && !compact ? "px-4 py-4 sm:px-5 sm:py-5" : ""}`}
      >
        {products.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center ${
              compact ? "px-3 py-4" : "px-4 py-8"
            }`}
          >
            <Package
              className={`text-bakery-ink/70 ${compact ? "h-8 w-8" : "h-12 w-12"}`}
              strokeWidth={1.75}
            />
            <p
              className={`font-semibold text-bakery-muted ${
                compact ? "mt-2 text-[12px]" : "mt-3 text-[14px]"
              }`}
            >
              {labels.noActiveOrders}
            </p>
          </div>
        ) : (
          <>
            <div className="dashboard-prep-top-band shrink-0 text-center">
              <p
                className={
                  compact
                    ? "text-[22px] font-extrabold leading-none text-bakery-primary"
                    : "text-[28px] font-extrabold leading-none text-bakery-primary"
                }
              >
                {grandTotal}
                <span
                  className={`ms-1 font-bold text-bakery-ink ${
                    compact ? "text-[12px]" : "text-[14px]"
                  }`}
                >
                  {labels.units}
                </span>
              </p>
            </div>
            {spread || compact ? (
              <div
                className={`no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-2.5 pt-2 sm:px-4 sm:pb-3 ${
                  spread ? "sm:pt-3" : ""
                }`}
              >
                <div
                  className={`grid grid-cols-2 content-start ${
                    spread ? "gap-3" : "gap-2"
                  }`}
                >
                  {productTiles}
                </div>
              </div>
            ) : (
              <div className="px-4 pb-4 pt-3">
                <div className="grid grid-cols-2 gap-3">{productTiles}</div>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <PrepDetailModal
          product={selected}
          labels={labels}
          anonymousLabel={labels.anonymousCustomer}
          onCustomerClick={openCustomer}
          onClose={() => setSelected(null)}
        />
      )}
      {customerModal}
    </div>
  );
}
