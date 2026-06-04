"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Input,
  SquareCard,
  Badge,
  Alert,
  Toggle,
} from "@/components/ui";
import { ProductImageField } from "@/components/product-image-field";
import { ProductSuccessModal } from "@/components/product-success-modal";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";
import { playProductAddedSound } from "@/lib/ui-sounds";
import { getEffectivePrice, hasDiscount } from "@/lib/product-price";
import { formatStockLabel } from "@/lib/product-stock";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";

type Product = {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  stock?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
};

function toPreviewProducts(
  items: {
    id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    stock?: number | null;
    description?: string | null;
    imageUrl?: string | null;
    isActive?: boolean;
  }[]
): Product[] {
  return items.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    salePrice: p.salePrice ?? null,
    stock: p.stock ?? null,
    description: p.description ?? null,
    imageUrl: p.imageUrl ?? null,
    isActive: p.isActive ?? true,
  }));
}

export function ProductsManager({
  previewOnly = false,
  initialProducts,
}: {
  previewOnly?: boolean;
  initialProducts?: Parameters<typeof toPreviewProducts>[0];
} = {}) {
  const { labels, formatMoney } = useAppLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [products, setProducts] = useState<Product[]>(() =>
    previewOnly && initialProducts ? toPreviewProducts(initialProducts) : []
  );
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [limitDiscountOn, setLimitDiscountOn] = useState(false);
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successName, setSuccessName] = useState("");

  async function load() {
    if (previewOnly) return;
    const res = await fetch("/api/dashboard/products");
    const data = await res.json();
    if (res.ok) setProducts(data.products);
  }

  useEffect(() => {
    load();
  }, [previewOnly]);

  async function addProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (previewOnly) {
      const fd = new FormData(e.currentTarget);
      const name = String(fd.get("name") ?? "").trim();
      const price = Number(fd.get("price"));
      if (!name || Number.isNaN(price)) return;
      setProducts((prev) => [
        {
          id: `preview-${Date.now()}`,
          name,
          price,
          salePrice: null,
          stock: null,
          description: String(fd.get("description") ?? "") || null,
          imageUrl: imageData,
          isActive: true,
        },
        ...prev,
      ]);
      formRef.current?.reset();
      setImagePreview(null);
      setImageData(null);
      setLimitDiscountOn(false);
      setMoreDetailsOpen(false);
      setSuccessName(name);
      playProductAddedSound();
      setSuccessOpen(true);
      return;
    }
    setAdding(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const price = Number(fd.get("price"));
    const saleRaw = String(fd.get("salePrice") ?? "").trim();
    const salePrice = saleRaw ? Number(saleRaw) : null;
    const limitOn = limitDiscountOn;
    const maxDiscountRaw = String(fd.get("maxDiscount") ?? "").trim();

    if (limitOn && (!saleRaw || Number.isNaN(salePrice!))) {
      setError(labels.productDiscountRequired);
      setAdding(false);
      return;
    }

    if (saleRaw && salePrice != null && !Number.isNaN(salePrice)) {
      if (salePrice >= price) {
        setError(labels.productDiscountBelowPrice);
        setAdding(false);
        return;
      }
      if (limitOn) {
        const maxDiscount = Number(maxDiscountRaw);
        if (!maxDiscountRaw || Number.isNaN(maxDiscount) || maxDiscount <= 0) {
          setError(labels.productMaxDiscountRequired);
          setAdding(false);
          return;
        }
        if (price - salePrice > maxDiscount) {
          setError(`${labels.productMaxDiscountRequired} (${formatMoney(maxDiscount)})`);
          setAdding(false);
          return;
        }
      }
    }

    const stockRaw = String(fd.get("stock") ?? "").trim();
    let stock: number | null = null;
    if (stockRaw) {
      const parsedStock = parseInt(stockRaw, 10);
      if (Number.isNaN(parsedStock) || parsedStock < 0) {
        setError(labels.productStockInvalid);
        setAdding(false);
        return;
      }
      stock = parsedStock;
    }

    const res = await fetch("/api/dashboard/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: fd.get("description") || undefined,
        price,
        salePrice:
          salePrice != null && !Number.isNaN(salePrice) ? salePrice : null,
        stock,
        imageUrl: imageData || undefined,
      }),
    });
    setAdding(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    formRef.current?.reset();
    setImagePreview(null);
    setImageData(null);
    setLimitDiscountOn(false);
    setMoreDetailsOpen(false);
    setSuccessName(name);
    playProductAddedSound();
    setSuccessOpen(true);
    load();
  }

  async function toggleProduct(id: string, isActive: boolean) {
    if (previewOnly) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !isActive } : p))
      );
      return;
    }
    await fetch(`/api/dashboard/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    load();
  }

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} pb-2`}>
      <div className={`${DASHBOARD_SCROLL_MAIN} space-y-5`}>
      {previewOnly && (
        <p className="rounded-[14px] border border-amber-300/50 bg-amber-50/90 px-3 py-2 text-center text-[13px] font-bold text-amber-950">
          תצוגה מקדימה — השינויים לא נשמרים ולא מועלים לשרת
        </p>
      )}
      {error && <Alert variant="error">{error}</Alert>}

      <div className="bakery-float-panel rounded-[24px] p-4">
        <h2 className="w-full text-center text-[18px] font-extrabold text-bakery-ink">
          {labels.addProduct}
        </h2>
        <form
          ref={formRef}
          onSubmit={addProduct}
          className="mx-auto mt-4 flex w-full max-w-[320px] flex-col items-stretch gap-3"
        >
          <Input name="name" label={labels.productName} required />
          <Input
            name="price"
            label={labels.productPrice}
            type="number"
            step="0.01"
            required
            dir="ltr"
          />
          <Input name="description" label={labels.productDescription} />
          <ProductImageField
            preview={imagePreview}
            onChange={(url) => {
              setImagePreview(url);
              setImageData(url);
            }}
            onError={setError}
          />
          <div className="overflow-hidden rounded-[16px] border border-bakery-border/35 bg-bakery-card/50">
            <button
              type="button"
              onClick={() => setMoreDetailsOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 px-3 py-3 text-end"
              aria-expanded={moreDetailsOpen}
            >
              <span className="text-[15px] font-extrabold text-bakery-ink">
                {labels.productDiscountAndStock}
              </span>
              {moreDetailsOpen ? (
                <ChevronUp
                  className="h-5 w-5 shrink-0 text-bakery-ink"
                  strokeWidth={2}
                />
              ) : (
                <ChevronDown
                  className="h-5 w-5 shrink-0 text-bakery-ink"
                  strokeWidth={2}
                />
              )}
            </button>
            {moreDetailsOpen && (
              <div className="flex flex-col gap-3 border-t border-bakery-border/30 px-3 pb-3 pt-3">
                <Input
                  name="salePrice"
                  label={labels.productDiscount}
                  type="number"
                  step="0.01"
                  min={0.01}
                  dir="ltr"
                />
                <div className="w-full text-end">
                  <div className="inline-flex items-center gap-3">
                    <span className="text-[14px] font-bold text-bakery-ink">
                      {labels.productMaxDiscount}
                    </span>
                    <Toggle
                      enabled={limitDiscountOn}
                      onChange={setLimitDiscountOn}
                      ariaLabel={labels.productMaxDiscount}
                    />
                  </div>
                </div>
                {limitDiscountOn && (
                  <Input
                    name="maxDiscount"
                    label={labels.productMaxDiscount}
                    type="number"
                    step="0.01"
                    min={0.01}
                    required
                    dir="ltr"
                    placeholder="10"
                  />
                )}
                <Input
                  name="stock"
                  label={labels.productStock}
                  type="number"
                  step="1"
                  min={0}
                  dir="ltr"
                  placeholder={labels.productStockUnlimited}
                />
              </div>
            )}
          </div>
          <Button
            type="submit"
            variant="square"
            className="bakery-float-tile w-full"
            disabled={adding}
          >
            {adding ? labels.adding : labels.addProduct}
          </Button>
        </form>
      </div>

      {products.length > 0 && (
        <div className="mx-auto w-full max-w-[320px]">
          <p className="mb-2 text-center text-[15px] font-extrabold text-bakery-ink">
            {labels.products}
          </p>
          <div
            className="no-scrollbar aspect-square w-full overflow-y-auto overscroll-contain rounded-[20px] border-[1.2px] border-bakery-border/40 bg-bakery-card/50 p-2.5 shadow-[var(--shadow-bakery-card)] [-webkit-overflow-scrolling:touch]"
            role="region"
            aria-label={labels.products}
          >
            <div className="grid grid-cols-2 gap-2.5">
              {products.map((p) => (
                <SquareCard
                  key={p.id}
                  className="bakery-float-tile overflow-hidden rounded-[16px] p-0"
                >
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center bg-bakery-card text-2xl">
                      🧁
                    </div>
                  )}
                  <div className="p-2 text-center">
                    <p className="truncate text-[14px] font-extrabold">
                      {p.name}
                    </p>
                    {hasDiscount(p) ? (
                      <p className="mt-0.5">
                        <span className="text-[12px] text-bakery-muted line-through">
                          {formatMoney(p.price)}
                        </span>
                        <span className="ms-1 text-[13px] font-extrabold text-red-600">
                          {formatMoney(getEffectivePrice(p))}
                        </span>
                      </p>
                    ) : (
                      <p className="text-[13px] font-extrabold text-bakery-ink">
                        {formatMoney(p.price)}
                      </p>
                    )}
                    <p className="mt-0.5 text-[11px] font-semibold text-bakery-muted">
                      {formatStockLabel(p.stock)}
                    </p>
                    <div className="mt-1.5 flex flex-col items-center gap-0.5">
                      <Badge tone={p.isActive ? "success" : "default"}>
                        {p.isActive ? labels.active : labels.hidden}
                      </Badge>
                      <Button
                        variant="ghost"
                        className="text-[13px]"
                        onClick={() => toggleProduct(p.id, p.isActive)}
                      >
                        {p.isActive ? labels.hide : labels.show}
                      </Button>
                    </div>
                  </div>
                </SquareCard>
              ))}
            </div>
          </div>
        </div>
      )}

      <DashboardConfettiBackground active={successOpen} />

      <ProductSuccessModal
        open={successOpen}
        productName={successName}
        onClose={() => setSuccessOpen(false)}
      />
      </div>
    </div>
  );
}
