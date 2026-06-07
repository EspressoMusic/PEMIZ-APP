"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Button,
  Input,
  SquareCard,
  Alert,
  Toggle,
} from "@/components/ui";
import { ProductImageField } from "@/components/product-image-field";
import { ProductSuccessModal } from "@/components/product-success-modal";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";
import { getEffectivePrice, hasDiscount } from "@/lib/product-price";
import { formatStockLabel, parseStockInput } from "@/lib/product-stock";
import { ChevronDown, Package, Plus } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DASHBOARD_PAGE_ROOT } from "@/components/dashboard/dashboard-panel-frame";

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

function ProductStockEdit({
  stock,
  labels,
  onSave,
}: {
  stock: number | null | undefined;
  labels: ReturnType<typeof useAppLocale>["labels"];
  onSave: (stock: number | null) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [tracked, setTracked] = useState(stock != null);
  const [draft, setDraft] = useState(stock != null ? String(stock) : "");
  const [error, setError] = useState("");

  function close() {
    setOpen(false);
    setError("");
  }

  async function save() {
    setError("");
    let next: number | null = null;
    if (tracked) {
      const parsed = parseStockInput(draft);
      if (parsed == null) {
        setError(labels.productStockInvalid);
        return;
      }
      next = parsed;
    }
    await onSave(next);
    close();
  }

  if (!open) {
    return (
      <button
        type="button"
        className="text-[10px] font-semibold leading-snug text-bakery-muted underline-offset-2 transition hover:text-bakery-ink hover:underline"
        onClick={() => {
          setTracked(stock != null);
          setDraft(stock != null ? String(stock) : "");
          setError("");
          setOpen(true);
        }}
      >
        {formatStockLabel(stock)}
      </button>
    );
  }

  return (
    <div className="space-y-1.5 rounded-[10px] border border-bakery-border/30 bg-bakery-card/70 p-1.5 text-start">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-bakery-ink">
          {labels.productStock}
        </span>
        <Toggle
          enabled={tracked}
          onChange={setTracked}
          ariaLabel={labels.productStock}
        />
      </div>
      {tracked && (
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={draft}
          onChange={(e) =>
            setDraft(e.target.value.replace(/\D/g, ""))
          }
          dir="ltr"
          className="bakery-field w-full rounded-[10px] border border-bakery-border/32 bg-bakery-input px-2 py-1.5 text-[12px] text-bakery-ink outline-none"
          aria-label={labels.productStock}
        />
      )}
      {error ? (
        <p className="text-[10px] font-semibold text-bakery-error">{error}</p>
      ) : null}
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          className="rounded-[8px] bg-bakery-primary px-1 py-1 text-[10px] font-bold text-bakery-on-primary"
          onClick={() => void save()}
        >
          {labels.save}
        </button>
        <button
          type="button"
          className="rounded-[8px] border border-bakery-border/35 bg-bakery-card px-1 py-1 text-[10px] font-bold text-bakery-ink"
          onClick={close}
        >
          {labels.cancel}
        </button>
      </div>
    </div>
  );
}

const ProductCard = memo(function ProductCard({
  product: p,
  labels,
  formatMoney,
  onHide,
  onDelete,
  onStockSave,
}: {
  product: Product;
  labels: ReturnType<typeof useAppLocale>["labels"];
  formatMoney: (n: number) => string;
  onHide: () => void;
  onDelete: () => void;
  onStockSave: (stock: number | null) => void | Promise<void>;
}) {
  return (
    <SquareCard className="bakery-float-tile overflow-hidden rounded-[14px] p-0 transition">
      {p.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.imageUrl}
          alt=""
          className="h-[5.75rem] w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex h-[5.75rem] items-center justify-center bg-bakery-card text-3xl">
          🧁
        </div>
      )}
      <div className="flex flex-col gap-1.5 px-2 py-2 text-center">
        <p className="line-clamp-2 text-[12px] font-extrabold leading-snug text-bakery-ink">
          {p.name}
        </p>
        {hasDiscount(p) ? (
          <div className="flex flex-col items-center gap-0.5">
            <span
              dir="ltr"
              className="text-[10px] font-medium tabular-nums text-bakery-muted line-through"
            >
              {formatMoney(p.price)}
            </span>
            <span
              dir="ltr"
              className="text-[12px] font-extrabold tabular-nums text-bakery-sale"
            >
              {formatMoney(getEffectivePrice(p))}
            </span>
          </div>
        ) : (
          <p
            dir="ltr"
            className="text-[12px] font-extrabold tabular-nums text-bakery-ink"
          >
            {formatMoney(p.price)}
          </p>
        )}
        <ProductStockEdit
          stock={p.stock}
          labels={labels}
          onSave={onStockSave}
        />
        <div className="mt-0.5 grid grid-cols-2 gap-1.5 border-t border-bakery-border/25 pt-1.5">
          <button
            type="button"
            className="flex min-h-[2rem] items-center justify-center rounded-[10px] bg-[#F9F3E5] px-1 py-1.5 text-[11px] font-bold text-bakery-ink transition hover:bg-bakery-cream-hover active:scale-[0.98]"
            onClick={onHide}
          >
            {p.isActive ? labels.hide : labels.show}
          </button>
          <button
            type="button"
            className="flex min-h-[2rem] items-center justify-center rounded-[10px] bg-[#F9F3E5] px-1 py-1.5 text-[11px] font-bold text-bakery-sale transition hover:bg-bakery-cream-hover active:scale-[0.98]"
            onClick={onDelete}
          >
            {labels.delete}
          </button>
        </div>
      </div>
    </SquareCard>
  );
});

export function ProductsManager({
  previewOnly = false,
  initialProducts,
}: {
  previewOnly?: boolean;
  initialProducts?: Parameters<typeof toPreviewProducts>[0];
} = {}) {
  const { labels, formatMoney, locale } = useAppLocale();
  const formRef = useRef<HTMLFormElement>(null);

  const [products, setProducts] = useState<Product[]>(() =>
    previewOnly && initialProducts ? toPreviewProducts(initialProducts) : []
  );
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [productsListOpen, setProductsListOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successName, setSuccessName] = useState("");

  const load = useCallback(async () => {
    if (previewOnly) return;
    const res = await fetch("/api/dashboard/products");
    const data = await res.json();
    if (res.ok) setProducts(data.products);
  }, [previewOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  async function addProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const price = Number(fd.get("price"));
    const saleRaw = String(fd.get("salePrice") ?? "").trim();
    const salePrice = saleRaw ? Number(saleRaw) : null;
    const maxDiscountRaw = String(fd.get("maxDiscount") ?? "").trim();

    if (!name || Number.isNaN(price)) return;

    if (discountOpen) {
      if (!saleRaw || Number.isNaN(salePrice!)) {
        setError(labels.productDiscountRequired);
        return;
      }
      if (salePrice! >= price) {
        setError(labels.productDiscountBelowPrice);
        return;
      }
      const maxDiscount = Number(maxDiscountRaw);
      if (!maxDiscountRaw || Number.isNaN(maxDiscount) || maxDiscount <= 0) {
        setError(labels.productMaxDiscountRequired);
        return;
      }
      if (price - salePrice! > maxDiscount) {
        setError(
          `${labels.productMaxDiscountRequired} (${formatMoney(maxDiscount)})`
        );
        return;
      }
    }

    let stock: number | null = null;
    if (stockOpen) {
      const stockRaw = String(fd.get("stock") ?? "").trim();
      if (!stockRaw) {
        setError(labels.productStockRequired);
        return;
      }
      const parsedStock = parseStockInput(stockRaw);
      if (parsedStock == null) {
        setError(labels.productStockInvalid);
        return;
      }
      stock = parsedStock;
    }

    if (previewOnly) {
      setProducts((prev) => [
        {
          id: `preview-${Date.now()}`,
          name,
          price,
          salePrice:
            discountOpen && salePrice != null && !Number.isNaN(salePrice)
              ? salePrice
              : null,
          stock,
          description: String(fd.get("description") ?? "") || null,
          imageUrl: imageData,
          isActive: true,
        },
        ...prev,
      ]);
      formRef.current?.reset();
      setImagePreview(null);
      setImageData(null);
      setDiscountOpen(false);
      setStockOpen(false);
      setAddFormOpen(false);
      setSuccessName(name);
      setSuccessOpen(true);
      return;
    }

    setAdding(true);
    const res = await fetch("/api/dashboard/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: fd.get("description") || undefined,
        price,
        salePrice:
          discountOpen && salePrice != null && !Number.isNaN(salePrice)
            ? salePrice
            : null,
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
    const data = await res.json();
    if (data.product) {
      setProducts((prev) => [data.product as Product, ...prev]);
    }
    formRef.current?.reset();
    setImagePreview(null);
    setImageData(null);
    setDiscountOpen(false);
    setStockOpen(false);
    setAddFormOpen(false);
    setSuccessName(name);
    setSuccessOpen(true);
  }

  const setProductActive = useCallback(
    async (id: string, isActive: boolean) => {
      if (previewOnly) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !isActive } : p))
        );
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !isActive } : p))
      );
      const res = await fetch(`/api/dashboard/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) void load();
    },
    [previewOnly, load]
  );

  const updateProductStock = useCallback(
    async (id: string, stock: number | null) => {
      if (previewOnly) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, stock } : p))
        );
        return;
      }

      const prev = products;
      setProducts((list) =>
        list.map((p) => (p.id === id ? { ...p, stock } : p))
      );
      const res = await fetch(`/api/dashboard/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
      if (!res.ok) {
        setProducts(prev);
        const d = await res.json().catch(() => ({}));
        setError((d as { error?: string }).error ?? labels.saveError);
      }
    },
    [previewOnly, products, labels.saveError]
  );

  const deleteProduct = useCallback(
    async (id: string, name: string) => {
      const msg =
        locale === "he"
          ? `למחוק את «${name}»?`
          : `Delete «${name}»?`;
      if (!confirm(msg)) return;

      if (previewOnly) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        return;
      }

      const prev = products;
      setProducts((list) => list.filter((p) => p.id !== id));
      const res = await fetch(`/api/dashboard/products/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setProducts(prev);
        setError(labels.saveError);
      }
    },
    [previewOnly, products, locale, labels.saveError]
  );

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} gap-2`}>
      {previewOnly && (
        <p className="shrink-0 rounded-[14px] border border-amber-300/50 bg-amber-50/90 px-3 py-2 text-center text-[13px] font-bold text-amber-950">
          תצוגה מקדימה — השינויים לא נשמרים ולא מועלים לשרת
        </p>
      )}
      {error && (
        <div className="shrink-0">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
        {!addFormOpen ? (
          <button
            type="button"
            onClick={() => setAddFormOpen(true)}
            className="dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition"
          >
            <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
              <Plus className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
              {labels.addProduct}
            </span>
            <ChevronDown
              className="h-5 w-5 shrink-0 text-bakery-muted"
              strokeWidth={2.5}
              aria-hidden
            />
          </button>
        ) : (
          <>
            <h2 className="mb-2 text-center text-[15px] font-extrabold text-bakery-ink">
              {labels.addProduct}
            </h2>
            <form
              ref={formRef}
              onSubmit={addProduct}
              className="flex flex-col gap-2 overflow-hidden px-0.5 text-start"
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
                compact
                preview={imagePreview}
                onChange={(url) => {
                  setImagePreview(url);
                  setImageData(url);
                }}
                onError={setError}
              />
              <div className="flex w-full items-center justify-between gap-2 rounded-[14px] border border-bakery-border/35 bg-bakery-card/50 px-2.5 py-2.5 text-start">
                <span className="text-[14px] font-bold text-bakery-ink">
                  {labels.productDiscount}
                </span>
                <Toggle
                  enabled={discountOpen}
                  onChange={setDiscountOpen}
                  ariaLabel={labels.productDiscount}
                />
              </div>
              {discountOpen && (
                <>
                  <Input
                    name="salePrice"
                    label={labels.productDiscountPrice}
                    type="number"
                    step="0.01"
                    min={0.01}
                    dir="ltr"
                    required
                  />
                  <Input
                    name="maxDiscount"
                    label={labels.productDiscountLimit}
                    type="number"
                    step="0.01"
                    min={0.01}
                    dir="ltr"
                    placeholder="10"
                    required
                  />
                </>
              )}
              <div className="flex w-full items-center justify-between gap-2 rounded-[14px] border border-bakery-border/35 bg-bakery-card/50 px-2.5 py-2.5 text-start">
                <span className="text-[14px] font-bold text-bakery-ink">
                  {labels.productStock}
                </span>
                <Toggle
                  enabled={stockOpen}
                  onChange={setStockOpen}
                  ariaLabel={labels.productStock}
                />
              </div>
              {stockOpen && (
                <Input
                  name="stock"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  dir="ltr"
                  required
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                  }}
                />
              )}
              <Button
                type="submit"
                variant="primary"
                className="w-full min-h-[44px] rounded-full font-extrabold"
                disabled={adding}
              >
                {adding ? labels.adding : labels.addProduct}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => setAddFormOpen(false)}
              aria-label={labels.close}
              className="mt-2 flex w-full min-h-[44px] items-center justify-center rounded-[22px] text-bakery-muted transition hover:bg-bakery-card/60 hover:text-bakery-ink active:opacity-80"
            >
              <ChevronDown
                className="h-6 w-6 rotate-180 transition-transform duration-200"
                strokeWidth={2.5}
                aria-hidden
              />
            </button>
          </>
        )}
      </div>

      <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
        <button
          type="button"
          onClick={() => {
            setProductsListOpen((v) => !v);
            if (addFormOpen) setAddFormOpen(false);
          }}
          aria-expanded={productsListOpen}
          aria-controls="dashboard-products-list"
          className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
            productsListOpen ? "bakery-float-tile--active" : ""
          }`}
        >
          <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <Package className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
            {labels.products}
            {products.length > 0 && (
              <span className="font-semibold text-bakery-muted">
                {" "}
                ({products.length})
              </span>
            )}
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform duration-200 ${
              productsListOpen ? "rotate-180" : ""
            }`}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>

        {productsListOpen && (
          <div
            id="dashboard-products-list"
            className="no-scrollbar mt-2 max-h-[50vh] overflow-y-auto overscroll-contain rounded-[18px] border border-bakery-border/40 bg-bakery-input p-2 shadow-[var(--shadow-bakery-card)] [-webkit-overflow-scrolling:touch]"
            role="region"
            aria-label={labels.products}
          >
            {products.length === 0 ? (
              <p className="py-6 text-center text-[14px] text-bakery-muted">
                {locale === "he" ? "אין מוצרים עדיין" : "No products yet"}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    labels={labels}
                    formatMoney={formatMoney}
                    onHide={() => void setProductActive(p.id, p.isActive)}
                    onDelete={() => void deleteProduct(p.id, p.name)}
                    onStockSave={(stock) => updateProductStock(p.id, stock)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <DashboardConfettiBackground active={successOpen} />

      <ProductSuccessModal
        open={successOpen}
        productName={successName}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}
