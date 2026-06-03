"use client";

import { useEffect, useState } from "react";
import { Package, X } from "lucide-react";
import type { PrepProductSummary } from "@/lib/dashboard-prep-summary";

function ProductThumb({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string | null;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={name}
        className="h-16 w-16 rounded-[14px] object-cover shadow-sm sm:h-20 sm:w-20"
      />
    );
  }
  return (
    <span className="flex h-16 w-16 items-center justify-center rounded-[14px] bg-bakery-card shadow-sm sm:h-20 sm:w-20">
      <Package className="h-8 w-8 text-bakery-muted" strokeWidth={1.5} />
    </span>
  );
}

function PrepDetailModal({
  product,
  onClose,
}: {
  product: PrepProductSummary;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`פירוט ${product.name}`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="סגור"
      />
      <div className="relative max-h-[85dvh] w-full max-w-md overflow-hidden rounded-[24px] bg-[#fdf8f1] shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
        <div className="flex items-center justify-between border-b border-bakery-border/25 px-4 py-3">
          <div className="flex items-center gap-3">
            <ProductThumb name={product.name} imageUrl={product.imageUrl} />
            <div className="text-start">
              <p className="text-[18px] font-extrabold text-bakery-ink">
                {product.name}
              </p>
              <p className="text-[14px] font-bold text-bakery-primary">
                סה״כ להכנה: {product.totalQuantity}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-bakery-muted hover:bg-bakery-primary/10"
            aria-label="סגור"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <ul className="max-h-[60dvh] space-y-3 overflow-y-auto px-4 py-4">
          {product.orders.map((line, i) => (
            <li
              key={`${line.orderId}-${i}`}
              className="rounded-[18px] border border-bakery-border/25 bg-[#f5efe6] p-3 text-start"
            >
              <p className="text-[16px] font-extrabold text-bakery-ink">
                {line.customerName}{" "}
                <span className="text-bakery-primary">× {line.quantity}</span>
              </p>
              <p className="mt-1 text-[14px] text-bakery-muted" dir="ltr">
                {line.customerPhone}
              </p>
              {line.customerEmail && (
                <p className="text-[13px] text-bakery-muted" dir="ltr">
                  {line.customerEmail}
                </p>
              )}
              {line.notes && (
                <p className="mt-2 text-[13px] text-bakery-ink">
                  הערה: {line.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function DashboardPrepSummary({
  initialProducts,
  loadFromApi = false,
}: {
  initialProducts: PrepProductSummary[];
  loadFromApi?: boolean;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [selected, setSelected] = useState<PrepProductSummary | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    if (!loadFromApi) return;
    fetch("/api/dashboard/prep-summary")
      .then((r) => r.json())
      .then((d) => {
        if (d.products) setProducts(d.products);
      })
      .catch(() => {});
  }, [loadFromApi]);

  const grandTotal = products.reduce((s, p) => s + p.totalQuantity, 0);

  return (
    <div className="w-full text-center">
      <div className="bakery-float-panel rounded-[24px] px-4 py-4 sm:px-5 sm:py-5">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Package className="h-12 w-12 text-bakery-muted" strokeWidth={1.25} />
            <p className="mt-3 text-[14px] font-semibold text-bakery-muted">
              אין הזמנות להכנה
            </p>
          </div>
        ) : (
          <>
            <p className="text-[28px] font-extrabold leading-none text-bakery-primary">
              {grandTotal}
              <span className="ms-1 text-[14px] font-bold text-bakery-ink">
                יחידות
              </span>
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {products.map((p) => (
                <button
                  key={p.productId}
                  type="button"
                  onClick={() => setSelected(p)}
                  className="bakery-float-tile flex aspect-square flex-col items-center justify-center gap-2 rounded-[20px] p-3 transition active:scale-[0.98]"
                >
                  <ProductThumb name={p.name} imageUrl={p.imageUrl} />
                  <span className="line-clamp-2 text-[12px] font-extrabold leading-tight text-bakery-ink sm:text-[13px]">
                    {p.name}
                  </span>
                  <span className="text-[22px] font-extrabold leading-none text-bakery-primary">
                    ×{p.totalQuantity}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {selected && (
        <PrepDetailModal product={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
