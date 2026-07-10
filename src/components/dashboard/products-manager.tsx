"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  Button,
  Input,
  Alert,
  Toggle,
} from "@/components/ui";
import { ProductImagesField } from "@/components/product-image-field";
import { ProductSuccessModal } from "@/components/product-success-modal";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";
import { getEffectivePrice, hasDiscount } from "@/lib/product-price";
import { parseStockInput, formatSellerProductStockLabel, getProductStockStatus, isProductStockAlert } from "@/lib/product-stock";
import { Package, Pencil, Plus } from "lucide-react";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardActionRowButton } from "@/components/dashboard/dashboard-action-row";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DASHBOARD_PAGE_ROOT } from "@/components/dashboard/dashboard-panel-frame";
import {
  normalizeProductImageUrls,
  primaryProductImageUrl,
} from "@/lib/product-image-urls";

type Product = {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  stock?: number | null;
  serviceDurationMinutes?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  isActive: boolean;
};

function productImages(p: Product): string[] {
  return normalizeProductImageUrls(p.imageUrls, p.imageUrl);
}

function toPreviewProducts(
  items: {
    id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    stock?: number | null;
    serviceDurationMinutes?: number | null;
    description?: string | null;
    imageUrl?: string | null;
    imageUrls?: string[];
    isActive?: boolean;
  }[]
): Product[] {
  return items.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    salePrice: p.salePrice ?? null,
    stock: p.stock ?? null,
    serviceDurationMinutes: p.serviceDurationMinutes ?? null,
    description: p.description ?? null,
    imageUrl: p.imageUrl ?? null,
    imageUrls: p.imageUrls ?? normalizeProductImageUrls(null, p.imageUrl ?? null),
    isActive: p.isActive ?? true,
  }));
}

function ProductStockEdit({
  stock,
  labels,
  previewOnly = false,
  onSave,
}: {
  stock: number | null | undefined;
  labels: ReturnType<typeof useAppLocale>["labels"];
  previewOnly?: boolean;
  onSave: (stock: number | null) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [tracked, setTracked] = useState(stock != null);
  const [draft, setDraft] = useState(stock != null ? String(stock) : "");
  const [error, setError] = useState("");
  const stockStatus = getProductStockStatus(stock);
  const stockAlert = isProductStockAlert(stock);
  const stockLabel = formatSellerProductStockLabel(stock, labels);

  useEffect(() => {
    if (open) return;
    setTracked(stock != null);
    setDraft(stock != null ? String(stock) : "");
  }, [stock, open]);

  function openEdit() {
    setTracked(stock != null);
    setDraft(stock != null ? String(stock) : "");
    setError("");
    setOpen(true);
  }

  function addToDraft(amount: number) {
    const current = parseStockInput(draft) ?? 0;
    setDraft(String(current + amount));
    setTracked(true);
  }

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
    const boxClassName = `w-full rounded-[10px] border px-2 py-1.5 ${
      stockAlert
        ? "border-bakery-error/40 bg-[#faf0ee]"
        : stockStatus === "unlimited"
          ? "border-bakery-border/25 bg-bakery-card/50"
          : "border-bakery-border/30 bg-bakery-card/70"
    }`;

    const content =
      stockStatus === "low" ? (
        <>
          <span className="block text-center text-[10px] font-bold text-bakery-error">
            {labels.productStockLow}
          </span>
          <span
            className="mt-0.5 block text-center text-[11px] font-extrabold leading-snug tabular-nums text-bakery-error"
            dir="ltr"
          >
            {stockLabel}
          </span>
        </>
      ) : (
        <span
          className={`block text-center text-[11px] font-extrabold leading-snug tabular-nums ${
            stockAlert ? "text-bakery-error" : "text-bakery-ink"
          }`}
          dir="ltr"
        >
          {stockLabel}
        </span>
      );

    return (
      <button
        type="button"
        onClick={openEdit}
        className={`${boxClassName} cursor-pointer text-center transition hover:brightness-[0.97] active:scale-[0.99]`}
        aria-label={labels.productStockEdit}
      >
        {content}
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
        <>
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
          <div className="flex flex-wrap gap-1">
            {[5, 10, 25, 50].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => addToDraft(amount)}
                className="rounded-full border border-bakery-border/35 bg-bakery-card px-2 py-0.5 text-[10px] font-bold tabular-nums text-bakery-ink transition hover:bg-bakery-cream-hover"
              >
                +{amount}
              </button>
            ))}
          </div>
        </>
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
  onProductSave,
  showStock,
  showDuration,
  previewOnly,
}: {
  product: Product;
  labels: ReturnType<typeof useAppLocale>["labels"];
  formatMoney: (n: number) => string;
  onHide: () => void;
  onDelete: () => void;
  onStockSave: (stock: number | null) => void | Promise<void>;
  onProductSave?: (patch: {
    name: string;
    description: string;
    price: number;
    salePrice: number | null;
    stock: number | null;
    serviceDurationMinutes: number | null;
    imageUrls: string[];
  }) => void | Promise<void>;
  showStock: boolean;
  showDuration: boolean;
  previewOnly?: boolean;
}) {
  const images = productImages(p);
  const cover = primaryProductImageUrl(images, null);
  const [editOpen, setEditOpen] = useState(false);
  const [draftName, setDraftName] = useState(p.name);
  const [draftDescription, setDraftDescription] = useState(p.description ?? "");
  const [draftPrice, setDraftPrice] = useState(String(p.price));
  const [draftDiscountEnabled, setDraftDiscountEnabled] = useState(
    p.salePrice != null
  );
  const [draftSalePrice, setDraftSalePrice] = useState(
    p.salePrice != null ? String(p.salePrice) : ""
  );
  const [draftStockTracked, setDraftStockTracked] = useState(p.stock != null);
  const [draftStock, setDraftStock] = useState(
    p.stock != null ? String(p.stock) : ""
  );
  const [draftDuration, setDraftDuration] = useState(
    p.serviceDurationMinutes != null ? String(p.serviceDurationMinutes) : ""
  );
  const [draftImages, setDraftImages] = useState<string[]>(images);
  const [editError, setEditError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const isHidden = !p.isActive;
  const hiddenDimClass = isHidden ? "opacity-50 saturate-[0.85]" : "";
  const stockAlert = showStock && isProductStockAlert(p.stock);
  const editTitle = showDuration ? labels.serviceEditTitle : labels.productEditTitle;

  useEffect(() => {
    if (!editOpen) return;
    setDraftName(p.name);
    setDraftDescription(p.description ?? "");
    setDraftPrice(String(p.price));
    setDraftDiscountEnabled(p.salePrice != null);
    setDraftSalePrice(p.salePrice != null ? String(p.salePrice) : "");
    setDraftStockTracked(p.stock != null);
    setDraftStock(p.stock != null ? String(p.stock) : "");
    setDraftDuration(
      p.serviceDurationMinutes != null ? String(p.serviceDurationMinutes) : ""
    );
    setDraftImages(images);
    setEditError("");
    // Only re-seed drafts when the sheet transitions to open — `p` and
    // `images` are recomputed every render, so including them here would
    // reset in-progress edits (or loop) on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editOpen]);

  async function saveProduct() {
    if (imageUploading) {
      setEditError(labels.productImageUploading);
      return;
    }
    const name = draftName.trim();
    const price = Number(draftPrice);
    if (!name || Number.isNaN(price) || price <= 0) {
      setEditError(labels.appointmentStoreSetupNeedService);
      return;
    }

    let salePrice: number | null = null;
    if (draftDiscountEnabled) {
      const parsedSale = Number(draftSalePrice);
      if (!draftSalePrice.trim() || Number.isNaN(parsedSale) || parsedSale <= 0) {
        setEditError(labels.productDiscountRequired);
        return;
      }
      if (parsedSale >= price) {
        setEditError(labels.productDiscountBelowPrice);
        return;
      }
      salePrice = parsedSale;
    }

    let stock: number | null = null;
    if (showStock && draftStockTracked) {
      const parsedStock = parseStockInput(draftStock);
      if (parsedStock == null) {
        setEditError(labels.productStockInvalid);
        return;
      }
      stock = parsedStock;
    }

    let serviceDurationMinutes: number | null = null;
    if (showDuration) {
      const parsedDuration = Number(draftDuration);
      if (
        !draftDuration.trim() ||
        Number.isNaN(parsedDuration) ||
        parsedDuration < 15
      ) {
        setEditError(labels.serviceDurationRequired);
        return;
      }
      serviceDurationMinutes = Math.round(parsedDuration);
    }

    await onProductSave?.({
      name,
      description: draftDescription.trim(),
      price,
      salePrice,
      stock,
      serviceDurationMinutes,
      imageUrls: draftImages,
    });
    setEditOpen(false);
  }

  return (
    <div
      className={`dashboard-product-list-card overflow-hidden rounded-[14px] p-0 transition ${
        stockAlert ? "ring-2 ring-bakery-error/35" : ""
      }`}
    >
      <div className={hiddenDimClass}>
      {cover ? (
        <div className="relative h-[5.75rem] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          {images.length > 1 ? (
            <span className="absolute end-1.5 top-1.5 rounded-full bg-bakery-ink/75 px-2 py-0.5 text-[10px] font-bold text-white">
              {images.length}
            </span>
          ) : null}
          {onProductSave && !previewOnly ? (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="absolute bottom-1.5 end-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-bakery-ink/75 text-white"
              aria-label={editTitle}
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          ) : null}
        </div>
      ) : onProductSave ? (
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="flex h-[5.75rem] w-full flex-col items-center justify-center gap-0.5 bg-bakery-card text-bakery-ink transition hover:bg-bakery-cream-light active:scale-[0.98]"
        >
          <span className="text-2xl leading-none" aria-hidden>
            🧁
          </span>
          <span className="px-1 text-[10px] font-bold leading-tight">
            {labels.productImageUpload}
          </span>
        </button>
      ) : (
        <div className="flex h-[5.75rem] items-center justify-center bg-bakery-card text-3xl">
          🧁
        </div>
      )}
      {onProductSave && !previewOnly ? (
        <DashboardActionSheet
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title={editTitle}
          ariaLabel={editTitle}
          placement="center"
          showBackButton
          compact
          fitContent
          topLayer
        >
          <div className="flex flex-col gap-3">
            {editError ? (
              <p className="rounded-2xl bg-bakery-error/10 px-3 py-2 text-[13px] font-semibold text-bakery-error">
                {editError}
              </p>
            ) : null}
            <div className="flex flex-col gap-1.5">
              <Input
                label={showDuration ? labels.serviceName : labels.productName}
                labelClassName="text-[13px]"
                className="py-2.5 text-[15px]"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                required
              />
              <Input
                label={labels.productPrice}
                labelClassName="text-[13px]"
                className="py-2.5 text-[15px]"
                type="number"
                step="0.01"
                dir="ltr"
                value={draftPrice}
                onChange={(e) => setDraftPrice(e.target.value)}
                required
              />
              <Input
                label={labels.productDescription}
                labelClassName="text-[13px]"
                className="py-2.5 text-[15px]"
                value={draftDescription}
                onChange={(e) => setDraftDescription(e.target.value)}
              />
              {showDuration ? (
                <Input
                  label={labels.serviceDurationMinutes}
                  labelClassName="text-[13px]"
                  className="py-2.5 text-[15px]"
                  type="number"
                  min={15}
                  max={480}
                  step={15}
                  dir="ltr"
                  value={draftDuration}
                  onChange={(e) => setDraftDuration(e.target.value)}
                  required
                />
              ) : null}
            </div>
            <ProductImagesField
              compact
              images={draftImages}
              onChange={setDraftImages}
              onError={setEditError}
              onUploadingChange={setImageUploading}
            />
            <div className="flex flex-col gap-1.5">
              <div className="dashboard-form-option-row flex w-full items-center justify-between gap-2 rounded-[14px] px-2.5 py-2 text-start">
                <span className="text-[13px] font-bold text-bakery-ink">
                  {labels.productDiscount}
                </span>
                <Toggle
                  enabled={draftDiscountEnabled}
                  onChange={setDraftDiscountEnabled}
                  ariaLabel={labels.productDiscount}
                />
              </div>
              {draftDiscountEnabled ? (
                <Input
                  label={labels.productDiscountPrice}
                  labelClassName="text-[13px]"
                  className="py-2.5 text-[15px]"
                  type="number"
                  step="0.01"
                  min={0.01}
                  dir="ltr"
                  value={draftSalePrice}
                  onChange={(e) => setDraftSalePrice(e.target.value)}
                  required
                />
              ) : null}
              {showStock ? (
                <>
                  <div className="dashboard-form-option-row flex w-full items-center justify-between gap-2 rounded-[14px] px-2.5 py-2 text-start">
                    <span className="text-[13px] font-bold text-bakery-ink">
                      {labels.productStock}
                    </span>
                    <Toggle
                      enabled={draftStockTracked}
                      onChange={setDraftStockTracked}
                      ariaLabel={labels.productStock}
                    />
                  </div>
                  {draftStockTracked ? (
                    <Input
                      labelClassName="text-[13px]"
                      className="py-2.5 text-[15px]"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      dir="ltr"
                      value={draftStock}
                      onChange={(e) =>
                        setDraftStock(e.target.value.replace(/\D/g, ""))
                      }
                      required
                    />
                  ) : null}
                </>
              ) : null}
            </div>
            <Button
              type="button"
              className="dashboard-form-submit-btn min-h-[44px] font-extrabold"
              disabled={imageUploading}
              onClick={() => void saveProduct()}
            >
              {imageUploading ? labels.productImageUploading : labels.save}
            </Button>
          </div>
        </DashboardActionSheet>
      ) : null}
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
        {showDuration && p.serviceDurationMinutes ? (
          <p className="text-[10px] font-bold text-bakery-muted" dir="ltr">
            {p.serviceDurationMinutes} min
          </p>
        ) : null}
        {showStock ? (
          <ProductStockEdit
            stock={p.stock}
            labels={labels}
            previewOnly={previewOnly}
            onSave={onStockSave}
          />
        ) : null}
      </div>
      </div>
      <div
        className={`grid grid-cols-2 gap-1.5 border-t px-2 pb-2 pt-1.5 ${
          isHidden ? "border-bakery-border/15" : "border-bakery-border/25"
        }`}
      >
        <button
          type="button"
          className="flex min-h-[2rem] items-center justify-center rounded-[10px] bg-bakery-primary px-1 py-1.5 text-[11px] font-bold text-bakery-on-primary transition hover:opacity-90 active:scale-[0.98]"
          onClick={onHide}
        >
          {p.isActive ? labels.hide : labels.show}
        </button>
        <button
          type="button"
          className={`flex min-h-[2rem] items-center justify-center rounded-[10px] border border-[#9a4545] bg-transparent px-1 py-1.5 text-[11px] font-bold text-[#9a4545] transition hover:bg-[#9a4545]/8 active:scale-[0.98] ${
            isHidden ? "opacity-50 saturate-[0.85]" : ""
          }`}
          onClick={onDelete}
        >
          {labels.delete}
        </button>
      </div>
    </div>
  );
});

const AddProductCard = memo(function AddProductCard({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dashboard-product-list-card overflow-hidden rounded-[14px] p-0 text-center transition hover:brightness-[0.98] active:scale-[0.98]"
    >
      <div className="flex h-[5.75rem] w-full flex-col items-center justify-center">
        <Plus className="h-7 w-7 text-bakery-primary" strokeWidth={1.75} />
      </div>
      <div className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 px-2 py-2">
        <p className="text-[15px] font-extrabold leading-snug text-bakery-ink">
          {label}
        </p>
      </div>
    </button>
  );
});

function ProductsPreviewBanner() {
  return (
    <p className="shrink-0 rounded-[14px] border border-amber-300/50 bg-amber-50/90 px-3 py-2 text-center text-[13px] font-bold text-amber-950">
      תצוגה מקדימה — השינויים לא נשמרים ולא מועלים לשרת
    </p>
  );
}

export function ProductsManager({
  previewOnly = false,
  initialProducts,
  mode = "products",
  autoOpenList = false,
  standaloneList = false,
  inline = false,
  welcomeSetup = false,
  onStandaloneClose,
  onProductsChange,
  saveHandleRef,
}: {
  previewOnly?: boolean;
  initialProducts?: Parameters<typeof toPreviewProducts>[0];
  mode?: "products" | "services";
  /** פותח ישר את רשימת המוצרים (לינקים ישירים לעמוד) */
  autoOpenList?: boolean;
  /** מודל בלבד מתפריט חנות — בלי כרטיסי hub */
  standaloneList?: boolean;
  /** טופס הוספה ורשימה בתוך מסך (למשל הגדרה ראשונית) */
  inline?: boolean;
  /** הגדרה ראשונית — שמירת שירות בלחיצה על אישור בתחתית */
  welcomeSetup?: boolean;
  onStandaloneClose?: () => void;
  onProductsChange?: (products: Product[]) => void;
  saveHandleRef?: MutableRefObject<(() => Promise<boolean>) | null>;
} = {}) {
  const { labels, formatMoney, locale } = useAppLocale();
  const isServices = mode === "services";
  const addLabel = isServices ? labels.addService : labels.addProduct;
  const listLabel = isServices ? labels.services : labels.products;
  const emptyLabel = isServices ? labels.noServicesYet : labels.noProductsYet;
  const formRef = useRef<HTMLFormElement>(null);
  const inlineFieldClass = "py-2.5 text-[15px]";

  const [products, setProducts] = useState<Product[]>(() =>
    previewOnly && initialProducts ? toPreviewProducts(initialProducts) : []
  );
  const visibleToCustomerCount = products.filter((p) => p.isActive).length;
  const productsListTitle =
    products.length > 0
      ? `${listLabel} (${visibleToCustomerCount}/${products.length})`
      : listLabel;
  const [error, setError] = useState("");
  const [imageData, setImageData] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [stockOpen, setStockOpen] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [productsListOpen, setProductsListOpen] = useState(
    autoOpenList || standaloneList
  );
  const [successOpen, setSuccessOpen] = useState(false);
  const [successName, setSuccessName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  const load = useCallback(async () => {
    if (previewOnly) return;
    const res = await fetch("/api/dashboard/products");
    const data = await res.json();
    if (res.ok) setProducts(data.products);
  }, [previewOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    onProductsChange?.(products);
  }, [products, onProductsChange]);

  useEffect(() => {
    if (inline && products.length === 0 && !welcomeSetup) {
      setAddFormOpen(true);
    }
  }, [inline, welcomeSetup, products.length]);

  const persistNewProductFromForm = useCallback(
    async (fd: FormData): Promise<boolean> => {
      setError("");
      const name = String(fd.get("name") ?? "").trim();
      const price = Number(fd.get("price"));
      const saleRaw = String(fd.get("salePrice") ?? "").trim();
      const salePrice = saleRaw ? Number(saleRaw) : null;
      const maxDiscountRaw = String(fd.get("maxDiscount") ?? "").trim();

      if (!name || Number.isNaN(price)) {
        setError(labels.appointmentStoreSetupNeedService);
        return false;
      }

      if (imageUploading) {
        setError(labels.productImageUploading);
        return false;
      }

      let serviceDurationMinutes: number | null = null;
      if (isServices) {
        const durationRaw = String(fd.get("serviceDurationMinutes") ?? "").trim();
        const parsedDuration = Number(durationRaw);
        if (!durationRaw || Number.isNaN(parsedDuration) || parsedDuration < 15) {
          setError(labels.serviceDurationRequired);
          return false;
        }
        serviceDurationMinutes = Math.round(parsedDuration);
      }

      if (discountOpen) {
        if (!saleRaw || Number.isNaN(salePrice!)) {
          setError(labels.productDiscountRequired);
          return false;
        }
        if (salePrice! >= price) {
          setError(labels.productDiscountBelowPrice);
          return false;
        }
        const maxDiscount = Number(maxDiscountRaw);
        if (!maxDiscountRaw || Number.isNaN(maxDiscount) || maxDiscount <= 0) {
          setError(labels.productMaxDiscountRequired);
          return false;
        }
        if (price - salePrice! > maxDiscount) {
          setError(
            `${labels.productMaxDiscountRequired} (${formatMoney(maxDiscount)})`
          );
          return false;
        }
      }

      let stock: number | null = null;
      if (!isServices && stockOpen) {
        const stockRaw = String(fd.get("stock") ?? "").trim();
        if (!stockRaw) {
          setError(labels.productStockRequired);
          return false;
        }
        const parsedStock = parseStockInput(stockRaw);
        if (parsedStock == null) {
          setError(labels.productStockInvalid);
          return false;
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
            serviceDurationMinutes,
            description: String(fd.get("description") ?? "") || null,
            imageUrl: imageData[0] ?? null,
            imageUrls: imageData,
            isActive: true,
          },
          ...prev,
        ]);
        formRef.current?.reset();
        setImageData([]);
        setDiscountOpen(false);
        setStockOpen(false);
        setAddFormOpen(false);
        if (!inline) {
          setSuccessName(name);
          setSuccessOpen(true);
        }
        return true;
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
          serviceDurationMinutes: serviceDurationMinutes ?? undefined,
          imageUrls: imageData.length > 0 ? imageData : undefined,
        }),
      });
      setAdding(false);
      if (!res.ok) {
        const d = await res.json();
        setError(d.error);
        return false;
      }
      const data = await res.json();
      if (data.product) {
        setProducts((prev) => [data.product as Product, ...prev]);
      }
      formRef.current?.reset();
      setImageData([]);
      setDiscountOpen(false);
      setStockOpen(false);
      setAddFormOpen(false);
      if (!inline) {
        setSuccessName(name);
        setSuccessOpen(true);
      }
      return true;
    },
    [
      discountOpen,
      formatMoney,
      imageData,
      imageUploading,
      inline,
      isServices,
      labels,
      previewOnly,
      stockOpen,
    ]
  );

  const saveDeferredProduct = useCallback(async (): Promise<boolean> => {
    const existingCount = products.filter((p) => p.isActive).length;
    if (formRef.current) {
      const name = String(new FormData(formRef.current).get("name") ?? "").trim();
      if (name) {
        return persistNewProductFromForm(new FormData(formRef.current));
      }
    }
    return existingCount >= 1;
  }, [persistNewProductFromForm, products]);

  useEffect(() => {
    if (!saveHandleRef) return;
    saveHandleRef.current = saveDeferredProduct;
    return () => {
      saveHandleRef.current = null;
    };
  });

  async function addProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await persistNewProductFromForm(new FormData(e.currentTarget));
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

  const updateProduct = useCallback(
    async (
      id: string,
      patch: {
        name: string;
        description: string;
        price: number;
        salePrice: number | null;
        stock: number | null;
        serviceDurationMinutes: number | null;
        imageUrls: string[];
      }
    ) => {
      if (previewOnly) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  ...patch,
                  imageUrl: patch.imageUrls[0] ?? null,
                }
              : p
          )
        );
        return;
      }

      const prev = products;
      setProducts((list) =>
        list.map((p) =>
          p.id === id
            ? {
                ...p,
                ...patch,
                imageUrl: patch.imageUrls[0] ?? null,
              }
            : p
        )
      );
      const res = await fetch(`/api/dashboard/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProducts(prev);
        setError((data as { error?: string }).error ?? labels.saveError);
        return;
      }
      if ((data as { product?: Product }).product) {
        setProducts((list) =>
          list.map((p) =>
            p.id === id ? ((data as { product: Product }).product as Product) : p
          )
        );
      }
    },
    [previewOnly, products, labels.saveError]
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

  const requestDeleteProduct = useCallback((id: string, name: string) => {
    setError("");
    setDeleteTarget({ id, name });
  }, []);

  const executeDeleteProduct = useCallback(async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;

    if (previewOnly) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteTarget(null);
      return;
    }

    setDeletingProduct(true);
    const prev = products;
    setProducts((list) => list.filter((p) => p.id !== id));

    const res = await fetch(`/api/dashboard/products/${id}`, {
      method: "DELETE",
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };

    setDeletingProduct(false);

    if (!res.ok) {
      setProducts(prev);
      setError(data.error ?? labels.saveError);
      return;
    }

    setError("");
    setDeleteTarget(null);
  }, [deleteTarget, previewOnly, products, labels.saveError]);

  const productsGrid = (
    <div className="grid grid-cols-2 gap-2">
      <AddProductCard label={addLabel} onClick={() => setAddFormOpen(true)} />
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          labels={labels}
          formatMoney={formatMoney}
          previewOnly={previewOnly}
          onHide={() => void setProductActive(p.id, p.isActive)}
          onDelete={() => requestDeleteProduct(p.id, p.name)}
          onStockSave={(stock) => updateProductStock(p.id, stock)}
          onProductSave={(patch) => updateProduct(p.id, patch)}
          showStock={!isServices}
          showDuration={isServices}
        />
      ))}
    </div>
  );

  const addFormFields = (
    <form
      ref={formRef}
      onSubmit={addProduct}
      className="flex flex-col gap-1.5 text-start"
    >
      <Input
        name="name"
        label={isServices ? labels.serviceName : labels.productName}
        labelClassName="text-[13px]"
        className={inlineFieldClass}
        required
      />
      <Input
        name="price"
        label={labels.productPrice}
        labelClassName="text-[13px]"
        className={inlineFieldClass}
        type="number"
        step="0.01"
        required
        dir="ltr"
      />
      {!inline ? (
        <Input
          name="description"
          label={labels.productDescription}
          labelClassName="text-[13px]"
          className="py-2.5 text-[15px]"
        />
      ) : null}
      {isServices ? (
        <Input
          name="serviceDurationMinutes"
          label={labels.serviceDurationMinutes}
          labelClassName="text-[13px]"
          className={inlineFieldClass}
          type="number"
          min={15}
          max={480}
          step={15}
          defaultValue={60}
          required
          dir="ltr"
        />
      ) : null}
      {!inline ? (
        <>
          <ProductImagesField
            compact
            images={imageData}
            onChange={setImageData}
            onError={setError}
            onUploadingChange={setImageUploading}
          />
          <div className="dashboard-form-option-row flex w-full items-center justify-between gap-2 rounded-[14px] px-2.5 py-2 text-start">
            <span className="text-[13px] font-bold text-bakery-ink">
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
                labelClassName="text-[13px]"
                className="py-2.5 text-[15px]"
                type="number"
                step="0.01"
                min={0.01}
                dir="ltr"
                required
              />
              <Input
                name="maxDiscount"
                label={labels.productDiscountLimit}
                labelClassName="text-[13px]"
                className="py-2.5 text-[15px]"
                type="number"
                step="0.01"
                min={0.01}
                dir="ltr"
                placeholder="10"
                required
              />
            </>
          )}
        </>
      ) : null}
      {!isServices && !inline && (
        <>
          <div className="dashboard-form-option-row flex w-full items-center justify-between gap-2 rounded-[14px] px-2.5 py-2 text-start">
            <span className="text-[13px] font-bold text-bakery-ink">
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
              labelClassName="text-[13px]"
              className="py-2.5 text-[15px]"
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
        </>
      )}
      {!welcomeSetup ? (
        <Button
          type="submit"
          className="dashboard-form-submit-btn mt-0.5 w-full min-h-[42px] rounded-full font-extrabold"
          disabled={adding || imageUploading}
        >
          {imageUploading
            ? labels.productImageUploading
            : adding
              ? labels.adding
              : addLabel}
        </Button>
      ) : null}
    </form>
  );

  const addFormSheet = (
    <DashboardActionSheet
      open={addFormOpen}
      onClose={() => setAddFormOpen(false)}
      title={addLabel}
      ariaLabel={addLabel}
      placement={isServices ? "center" : "upper"}
      showBackButton
      backButtonOutside
      compact
      warmPanel
      elevated
      fitContent
      panelClassName="dashboard-deal-form-sheet"
    >
      {addFormFields}
    </DashboardActionSheet>
  );

  const deleteProductSheet = (
    <DashboardActionSheet
      open={deleteTarget !== null}
      onClose={() => {
        if (deletingProduct) return;
        setError("");
        setDeleteTarget(null);
      }}
      title={labels.delete}
      ariaLabel={labels.delete}
      placement="center"
      expanded={false}
      fitContent
      panelClassName="w-full max-w-md"
    >
      <div className="space-y-6 px-2 py-2 text-center">
        {error ? (
          <p className="rounded-2xl bg-bakery-error/10 px-3 py-2 text-[13px] font-semibold text-bakery-error">
            {error}
          </p>
        ) : null}
        <p className="text-[15px] font-semibold leading-relaxed text-bakery-ink">
          {labels.confirmDeleteProduct.replace(
            "{name}",
            deleteTarget?.name ?? ""
          )}
        </p>
        <div className="flex flex-row items-stretch justify-center gap-3">
          <button
            type="button"
            disabled={deletingProduct}
            onClick={() => {
              setError("");
              setDeleteTarget(null);
            }}
            className="min-h-[48px] min-w-[7.5rem] rounded-xl border-2 border-bakery-border bg-bakery-card px-4 text-[15px] font-extrabold text-bakery-ink transition hover:bg-bakery-surface active:opacity-80 disabled:opacity-50"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            disabled={deletingProduct}
            onClick={() => void executeDeleteProduct()}
            className="min-h-[48px] min-w-[7.5rem] rounded-xl border-2 border-bakery-error/45 bg-bakery-card px-4 text-[15px] font-extrabold text-bakery-error transition hover:bg-bakery-error/10 active:opacity-80 disabled:opacity-50"
          >
            {deletingProduct ? labels.deleting : labels.delete}
          </button>
        </div>
      </div>
    </DashboardActionSheet>
  );

  const productFeedback = (
    <>
      <DashboardConfettiBackground active={successOpen} />
      <ProductSuccessModal
        open={successOpen}
        productName={successName}
        onClose={() => setSuccessOpen(false)}
        title={
          isServices ? labels.serviceAddedTitle : labels.productAddedTitle
        }
        detail={
          isServices ? labels.serviceAddedDetail : labels.productAddedDetail
        }
        closeAriaLabel={labels.close}
      />
    </>
  );

  const productsListSheet = (
    <DashboardActionSheet
      open={productsListOpen}
      onClose={() => {
        setProductsListOpen(false);
        if (standaloneList) onStandaloneClose?.();
      }}
      title={productsListTitle}
      ariaLabel={listLabel}
      placement="center"
      showBackButton
      warmPanel
    >
      {previewOnly ? <ProductsPreviewBanner /> : null}
      {productsGrid}
      {products.length === 0 ? (
        <p className="py-4 text-center text-[14px] text-bakery-muted">
          {emptyLabel}
        </p>
      ) : null}
    </DashboardActionSheet>
  );

  if (inline) {
    const showInlineForm = welcomeSetup || addFormOpen;

    return (
      <div className="space-y-3 text-start">
        {error ? (
          <div className="shrink-0">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}
        {products.length > 0 ? (
          <ul className="space-y-2">
            {products.map((p) => (
              <li
                key={p.id}
                className={
                  welcomeSetup
                    ? "rounded-[14px] border border-bakery-border/25 bg-bakery-card/80 px-3 py-2"
                    : "rounded-[14px] border border-bakery-border/30 bg-bakery-card/80 px-3 py-2.5"
                }
              >
                <p className="text-[15px] font-extrabold text-bakery-ink">
                  {p.name}
                </p>
                {isServices && p.serviceDurationMinutes ? (
                  <p className="mt-0.5 text-[12px] font-semibold text-bakery-muted">
                    {p.serviceDurationMinutes} {locale === "he" ? "דק׳" : "min"}
                    {" · "}
                    {formatMoney(p.price)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
        {showInlineForm ? (
          welcomeSetup ? (
            addFormFields
          ) : (
            <div className="rounded-[18px] border border-bakery-border/30 bg-bakery-card/60 p-3">
              {addFormFields}
            </div>
          )
        ) : welcomeSetup ? null : (
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-full font-extrabold"
            onClick={() => setAddFormOpen(true)}
          >
            {addLabel}
          </Button>
        )}
      </div>
    );
  }

  if (standaloneList) {
    return (
      <>
        {error ? (
          <div className="shrink-0">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}
        {productsListSheet}
        {addFormSheet}
        {deleteProductSheet}
        {productFeedback}
      </>
    );
  }

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} gap-2`}>
      {previewOnly && !autoOpenList ? <ProductsPreviewBanner /> : null}
      {error && (
        <div className="shrink-0">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {!autoOpenList ? (
        <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
          <button
            type="button"
            data-tour-id="tour-add-product"
            onClick={() => {
              setProductsListOpen(false);
              setAddFormOpen(true);
            }}
            className="dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition"
          >
            <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
              <Plus className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
              {addLabel}
            </span>
          </button>
        </div>
      ) : null}

      {!autoOpenList ? (
        <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
          <button
            type="button"
            onClick={() => {
              setAddFormOpen(false);
              setProductsListOpen(true);
            }}
            className="dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition"
          >
            <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
              <Package className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
              {listLabel}
              {products.length > 0 && (
                <span className="font-semibold text-bakery-muted">
                  {" "}
                  ({visibleToCustomerCount}/{products.length})
                </span>
              )}
            </span>
          </button>
        </div>
      ) : null}

      {addFormSheet}

      {productsListSheet}

      {deleteProductSheet}

      {productFeedback}
    </div>
  );
}

/** שורה בחנות — פותחת ישר את רשימת המוצרים / השירותים */
export function DashboardProductsEntry({
  previewOnly = false,
  initialProducts,
  mode = "products",
}: {
  previewOnly?: boolean;
  initialProducts?: Parameters<typeof toPreviewProducts>[0];
  mode?: "products" | "services";
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();
  const title = mode === "services" ? labels.services : labels.products;

  return (
    <>
      <DashboardActionRowButton
        onClick={() => setOpen(true)}
        icon={Package}
        title={title}
      />
      {open ? (
        <ProductsManager
          standaloneList
          previewOnly={previewOnly}
          initialProducts={initialProducts}
          mode={mode}
          onStandaloneClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
