"use client";

import { useCallback, useEffect, useState } from "react";
import { Package, X, User } from "lucide-react";
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
        className={`${size} object-cover shadow-sm`}
      />
    );
  }
  return (
    <span
      className={`flex items-center justify-center bg-bakery-card shadow-sm ${size}`}
    >
      <Package
        className={compact ? "h-5 w-5 text-bakery-muted" : "h-8 w-8 text-bakery-muted"}
        strokeWidth={1.5}
      />
    </span>
  );
}

function PrepDetailModal({
  product,
  onClose,
  labels,
}: {
  product: PrepProductSummary;
  onClose: () => void;
  labels: DashboardLabels;
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
        className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={labels.close}
      />
      <div className="relative max-h-[85dvh] w-full max-w-md overflow-hidden rounded-[24px] bg-bakery-cream-sheet shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
        <div className="flex items-center justify-between border-b border-bakery-border/25 px-4 py-3">
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
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bakery-primary/12 text-bakery-primary">
                    <User className="h-5 w-5" strokeWidth={2} />
                  </span>
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
                    <a
                      href={`tel:${customer.customerPhone.replace(/\s/g, "")}`}
                      className="mt-1 block text-[14px] font-semibold text-bakery-ink underline-offset-2 hover:underline"
                      dir="ltr"
                    >
                      {customer.customerPhone}
                    </a>
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
      className={`bakery-float-tile flex flex-col items-center justify-center transition active:scale-[0.98] disabled:opacity-60 ${
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
        className={`bakery-float-panel ${
          spread
            ? "flex h-full min-h-0 max-h-full flex-1 flex-col overflow-hidden rounded-[24px] px-4 py-4 sm:px-5 sm:py-5"
            : compact
              ? "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] px-3 py-2.5"
              : "rounded-[24px] px-4 py-4 sm:px-5 sm:py-5"
        }`}
      >
        {products.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center ${
              compact ? "py-4" : "py-8"
            }`}
          >
            <Package
              className={`text-bakery-muted ${compact ? "h-8 w-8" : "h-12 w-12"}`}
              strokeWidth={1.25}
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
            <p
              className={`shrink-0 ${
                compact
                  ? "text-[22px] font-extrabold leading-none text-bakery-primary"
                  : "text-[28px] font-extrabold leading-none text-bakery-primary"
              }`}
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
            {spread || compact ? (
              <div
                className={`no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain ${
                  spread ? "mt-3" : "mt-2"
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
              <div className="mt-4 grid grid-cols-2 gap-3">{productTiles}</div>
            )}
          </>
        )}
      </div>

      {selected && (
        <PrepDetailModal
          product={selected}
          labels={labels}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
