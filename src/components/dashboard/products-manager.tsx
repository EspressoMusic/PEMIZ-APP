"use client";

import { useEffect, useRef, useState } from "react";
import {
  Button,
  Input,
  Panel,
  SquareCard,
  Badge,
  Alert,
  PageTitle,
} from "@/components/ui";
import { ProductImageField } from "@/components/product-image-field";
import { ProductSuccessModal } from "@/components/product-success-modal";
import { getEffectivePrice, hasDiscount } from "@/lib/product-price";
import { formatStockLabel } from "@/lib/product-stock";
import { ChevronDown, ChevronUp, Gift, Plus, X } from "lucide-react";

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

type Deal = {
  id: string;
  name: string;
  dealPrice: number;
  validUntil: string;
  isActive: boolean;
  products: Product[];
  _count?: { redemptions: number };
};

export function ProductsManager() {
  const formRef = useRef<HTMLFormElement>(null);
  const dealFormRef = useRef<HTMLFormElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [error, setError] = useState("");
  const [dealError, setDealError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addingDeal, setAddingDeal] = useState(false);
  const [limitDiscountOn, setLimitDiscountOn] = useState(false);
  const [moreDetailsOpen, setMoreDetailsOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successName, setSuccessName] = useState("");
  const [showDealForm, setShowDealForm] = useState(false);
  const [dealValidityMode, setDealValidityMode] = useState<
    "1d" | "3d" | "7d" | "14d" | "custom"
  >("7d");
  const [dealSelectedIds, setDealSelectedIds] = useState<string[]>([]);
  const [showDealProductPicker, setShowDealProductPicker] = useState(false);

  const DEAL_VALIDITY_OPTIONS: {
    id: typeof dealValidityMode;
    label: string;
    days?: number;
  }[] = [
    { id: "1d", label: "יום", days: 1 },
    { id: "3d", label: "3 ימים", days: 3 },
    { id: "7d", label: "שבוע", days: 7 },
    { id: "14d", label: "שבועיים", days: 14 },
    { id: "custom", label: "התאמה אישית" },
  ];

  async function load() {
    const [pRes, dRes] = await Promise.all([
      fetch("/api/dashboard/products"),
      fetch("/api/dashboard/deals"),
    ]);
    const pData = await pRes.json();
    const dData = await dRes.json();
    if (pRes.ok) setProducts(pData.products);
    if (dRes.ok) setDeals(dData.deals);
  }

  useEffect(() => {
    load();
  }, []);

  async function addProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setAdding(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const price = Number(fd.get("price"));
    const saleRaw = String(fd.get("salePrice") ?? "").trim();
    const salePrice = saleRaw ? Number(saleRaw) : null;
    const limitOn = limitDiscountOn;
    const maxDiscountRaw = String(fd.get("maxDiscount") ?? "").trim();

    if (limitOn && (!saleRaw || Number.isNaN(salePrice!))) {
      setError("יש למלא מחיר הנחה כשמגבילים את גובה ההנחה");
      setAdding(false);
      return;
    }

    if (saleRaw && salePrice != null && !Number.isNaN(salePrice)) {
      if (salePrice >= price) {
        setError("מחיר ההנחה חייב להיות נמוך מהמחיר הרגיל");
        setAdding(false);
        return;
      }
      if (limitOn) {
        const maxDiscount = Number(maxDiscountRaw);
        if (!maxDiscountRaw || Number.isNaN(maxDiscount) || maxDiscount <= 0) {
          setError("יש למלא מקסימום הנחה");
          setAdding(false);
          return;
        }
        if (price - salePrice > maxDiscount) {
          setError(`ההנחה גדולה מהמקסימום (${maxDiscount.toFixed(2)})`);
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
        setError("מלאי חייב להיות מספר שלם (0 ומעלה)");
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
    setSuccessOpen(true);
    load();
  }

  async function addDeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDealError("");
    setAddingDeal(true);
    const fd = new FormData(dealFormRef.current!);
    let validUntil = "";

    if (dealValidityMode === "custom") {
      const validLocal = String(fd.get("validUntil") ?? "");
      if (!validLocal) {
        setDealError("יש לבחור תאריך");
        setAddingDeal(false);
        return;
      }
      const [y, m, d] = validLocal.split("-").map(Number);
      const parsed = new Date(y, m - 1, d, 23, 59, 59, 999);
      if (
        Number.isNaN(parsed.getTime()) ||
        parsed.getTime() <= Date.now()
      ) {
        setDealError("תאריך התוקף חייב להיות בעתיד");
        setAddingDeal(false);
        return;
      }
      validUntil = parsed.toISOString();
    } else {
      const opt = DEAL_VALIDITY_OPTIONS.find((o) => o.id === dealValidityMode);
      const days = opt?.days ?? 7;
      validUntil = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000
      ).toISOString();
    }

    if (dealSelectedIds.length < 2) {
      setDealError("יש לבחור לפחות 2 מוצרים לדיל");
      setAddingDeal(false);
      return;
    }

    const res = await fetch("/api/dashboard/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        productIds: dealSelectedIds,
        dealPrice: Number(fd.get("dealPrice")),
        validUntil,
      }),
    });
    setAddingDeal(false);
    if (!res.ok) {
      const d = await res.json();
      setDealError(d.error);
      return;
    }
    dealFormRef.current?.reset();
    setDealValidityMode("7d");
    setDealSelectedIds([]);
    setShowDealProductPicker(false);
    setShowDealForm(false);
    load();
  }

  function addProductToDeal(productId: string) {
    setDealSelectedIds((ids) =>
      ids.includes(productId) ? ids : [...ids, productId]
    );
  }

  function removeProductFromDeal(productId: string) {
    setDealSelectedIds((ids) => ids.filter((id) => id !== productId));
  }

  async function toggleProduct(id: string, isActive: boolean) {
    await fetch(`/api/dashboard/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    load();
  }

  async function toggleDeal(id: string, isActive: boolean) {
    await fetch(`/api/dashboard/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    load();
  }

  async function removeDeal(id: string) {
    if (!confirm("למחוק את הדיל?")) return;
    await fetch(`/api/dashboard/deals/${id}`, { method: "DELETE" });
    load();
  }

  const activeProducts = products.filter((p) => p.isActive);

  return (
    <div className="space-y-5 pb-2">
      <PageTitle>מוצרים</PageTitle>
      {error && <Alert variant="error">{error}</Alert>}

      <div className="bakery-float-panel rounded-[24px] p-4">
        <h2 className="text-center text-[18px] font-extrabold text-bakery-ink">
          הוספת מוצר
        </h2>
        <form
          ref={formRef}
          onSubmit={addProduct}
          className="mx-auto mt-4 flex w-full max-w-[320px] flex-col items-stretch gap-3"
        >
          <Input name="name" label="שם" required />
          <Input
            name="price"
            label="מחיר"
            type="number"
            step="0.01"
            required
            dir="ltr"
          />
          <Input name="description" label="תיאור" />
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
                פרטים נוספים
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
                  label="הנחה (מחיר מבצע ללקוח)"
                  type="number"
                  step="0.01"
                  min={0.01}
                  dir="ltr"
                />
                <label className="block w-full cursor-pointer text-end">
                  <span className="inline-flex items-center gap-2 text-[14px] font-bold text-bakery-ink">
                    הגבל הנחה עד
                    <input
                      type="checkbox"
                      checked={limitDiscountOn}
                      onChange={(e) => setLimitDiscountOn(e.target.checked)}
                      className="h-4 w-4 shrink-0"
                    />
                  </span>
                </label>
                {limitDiscountOn && (
                  <Input
                    name="maxDiscount"
                    label="מקסימום הנחה"
                    type="number"
                    step="0.01"
                    min={0.01}
                    required
                    dir="ltr"
                    placeholder="למשל 10"
                  />
                )}
                <Input
                  name="stock"
                  label="מלאי"
                  type="number"
                  step="1"
                  min={0}
                  dir="ltr"
                  placeholder="ריק = ללא הגבלה"
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
            {adding ? "מוסיף..." : "הוסף מוצר"}
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-2.5 min-[380px]:grid-cols-2 sm:gap-3 md:grid-cols-3">
        {products.map((p) => (
          <SquareCard
            key={p.id}
            className="bakery-float-tile overflow-hidden rounded-[20px] p-0"
          >
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-bakery-card text-3xl">
                🧁
              </div>
            )}
            <div className="p-3 text-center">
              <p className="truncate text-[17px] font-extrabold">{p.name}</p>
              {hasDiscount(p) ? (
                <p className="mt-1">
                  <span className="text-[14px] text-bakery-muted line-through">
                    {p.price.toFixed(2)}
                  </span>
                  <span className="ms-2 text-[16px] font-extrabold text-red-600">
                    {getEffectivePrice(p).toFixed(2)}
                  </span>
                </p>
              ) : (
                <p className="text-[16px] font-extrabold text-bakery-ink">
                  {p.price.toFixed(2)}
                </p>
              )}
              <p className="mt-1 text-[13px] font-semibold text-bakery-muted">
                {formatStockLabel(p.stock)}
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                <Badge tone={p.isActive ? "success" : "default"}>
                  {p.isActive ? "פעיל" : "מוסתר"}
                </Badge>
                <Button variant="ghost" onClick={() => toggleProduct(p.id, p.isActive)}>
                  {p.isActive ? "הסתר" : "הצג"}
                </Button>
              </div>
            </div>
          </SquareCard>
        ))}
      </div>

      <div className="bakery-float-panel rounded-[24px] p-4">
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-center text-[18px] font-extrabold text-bakery-ink">
            דילים
          </h2>
          <button
            type="button"
            onClick={() => {
              setShowDealForm((v) => {
                if (v) {
                  setDealSelectedIds([]);
                  setShowDealProductPicker(false);
                }
                return !v;
              });
            }}
            className="bakery-float-tile flex w-full max-w-[200px] aspect-square flex-col items-center justify-center gap-2 rounded-[20px] px-3"
          >
            <Gift className="h-10 w-10 text-bakery-ink" strokeWidth={1.5} />
            <span className="text-[14px] font-extrabold">הוסף דיל</span>
          </button>
        </div>

        {showDealForm && (
          <form
            ref={dealFormRef}
            onSubmit={addDeal}
            className="mx-auto mt-4 flex w-full max-w-[320px] flex-col items-stretch gap-3 border-t border-bakery-border/20 pt-4"
          >
            {dealError && <Alert variant="error">{dealError}</Alert>}
            <Input name="name" label="שם הדיל" required />

            <div className="space-y-3 text-center">
              <span className="text-[14px] font-bold text-bakery-ink">מוצרים בדיל</span>
              <button
                type="button"
                onClick={() => setShowDealProductPicker((v) => !v)}
                className="bakery-float-tile mx-auto flex aspect-square w-full max-w-[120px] flex-col items-center justify-center gap-1 rounded-[20px] p-3"
              >
                <Plus className="h-9 w-9 text-bakery-ink" strokeWidth={1.5} />
                <span className="text-[13px] font-extrabold">הוסף מוצר</span>
              </button>

              {showDealProductPicker && activeProducts.length > 0 && (
                <div className="grid max-h-[200px] grid-cols-2 gap-2 overflow-y-auto">
                  {activeProducts
                    .filter((p) => !dealSelectedIds.includes(p.id))
                    .map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => addProductToDeal(p.id)}
                        className="bakery-float-tile rounded-[14px] px-2 py-2.5 text-[12px] font-extrabold leading-tight text-bakery-ink transition active:scale-[0.98]"
                      >
                        {p.name}
                      </button>
                    ))}
                </div>
              )}

              {dealSelectedIds.length > 0 && (
                <ul className="space-y-2">
                  {dealSelectedIds.map((id) => {
                    const p = products.find((x) => x.id === id);
                    if (!p) return null;
                    return (
                      <li
                        key={id}
                        className="bakery-float-tile flex items-center justify-between gap-2 rounded-[14px] px-3 py-2"
                      >
                        <span className="text-[14px] font-extrabold text-bakery-ink">
                          {p.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeProductFromDeal(id)}
                          className="rounded-full p-1 text-bakery-muted hover:bg-bakery-card"
                          aria-label={`הסר ${p.name}`}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <Input
              name="dealPrice"
              label="מחיר דיל"
              type="number"
              step="0.01"
              required
              dir="ltr"
            />
            <div className="space-y-2 text-center">
              <span className="text-[14px] font-bold text-bakery-ink">תקף עד</span>
              <div className="flex flex-nowrap justify-center gap-1.5 overflow-x-auto pb-0.5 [-webkit-overflow-scrolling:touch]">
                {DEAL_VALIDITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDealValidityMode(opt.id)}
                    className={`shrink-0 rounded-full px-2.5 py-1.5 text-[12px] font-bold transition sm:px-3 sm:text-[13px] ${
                      dealValidityMode === opt.id
                        ? "bakery-float-tile--active bg-bakery-primary/15 text-bakery-primary ring-2 ring-bakery-primary/30"
                        : "border border-bakery-border/35 bg-bakery-input/80 text-bakery-ink hover:bg-bakery-card"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {dealValidityMode === "custom" && (
                <Input
                  name="validUntil"
                  label="תאריך"
                  type="date"
                  required
                  dir="ltr"
                />
              )}
            </div>
            <Button
              type="submit"
              variant="square"
              className="bakery-float-tile w-full"
              disabled={addingDeal || dealSelectedIds.length < 2}
            >
              {addingDeal ? "שומר..." : "שמור דיל"}
            </Button>
          </form>
        )}

        <ul className="mt-4 space-y-3">
          {deals.map((d) => (
            <li
              key={d.id}
              className="bakery-float-tile rounded-[18px] p-3 text-center"
            >
              <p className="text-[16px] font-extrabold text-bakery-ink">{d.name}</p>
              <p className="text-[14px] text-bakery-muted">
                {(d.products ?? [])
                  .map((p) => p.name)
                  .join(" + ")}
              </p>
              <p className="text-[18px] font-extrabold text-bakery-primary">
                {d.dealPrice.toFixed(2)}
              </p>
              <p className="text-[12px] text-bakery-muted">
                עד{" "}
                {new Date(d.validUntil).toLocaleDateString("he-IL")}
                {d._count != null && ` · מומש ${d._count.redemptions} פעמים`}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <Badge tone={d.isActive ? "success" : "default"}>
                  {d.isActive ? "פעיל" : "מושבת"}
                </Badge>
                <Button variant="ghost" onClick={() => toggleDeal(d.id, d.isActive)}>
                  {d.isActive ? "השבת" : "הפעל"}
                </Button>
                <Button variant="ghost" onClick={() => removeDeal(d.id)}>
                  מחק
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <ProductSuccessModal
        open={successOpen}
        productName={successName}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}
