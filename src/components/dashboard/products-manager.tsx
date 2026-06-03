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
import { Tag, Gift } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
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
  productA: Product;
  productB: Product;
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
  const [discountOn, setDiscountOn] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successName, setSuccessName] = useState("");
  const [showDealForm, setShowDealForm] = useState(false);

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
    const saleRaw = fd.get("salePrice");
    const salePrice =
      discountOn && saleRaw ? Number(saleRaw) : undefined;

    const res = await fetch("/api/dashboard/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: fd.get("description") || undefined,
        price,
        salePrice: salePrice ?? null,
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
    setDiscountOn(false);
    setSuccessName(name);
    setSuccessOpen(true);
    load();
  }

  async function addDeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDealError("");
    setAddingDeal(true);
    const fd = new FormData(dealFormRef.current!);
    const validLocal = String(fd.get("validUntil") ?? "");
    const validUntil = validLocal ? new Date(validLocal).toISOString() : "";

    const res = await fetch("/api/dashboard/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        productAId: fd.get("productAId"),
        productBId: fd.get("productBId"),
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
    setShowDealForm(false);
    load();
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
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <Input name="name" label="שם" required />
          <Input
            name="price"
            label="מחיר (₪)"
            type="number"
            step="0.01"
            required
            dir="ltr"
          />
          <label className="flex items-center gap-2 text-[14px] font-bold text-bakery-ink sm:col-span-2">
            <input
              type="checkbox"
              checked={discountOn}
              onChange={(e) => setDiscountOn(e.target.checked)}
              className="h-4 w-4"
            />
            <Tag className="h-4 w-4" />
            הנחה — מחיר מבצע ללקוח (אדום + מחיר קודם בפס)
          </label>
          {discountOn && (
            <Input
              name="salePrice"
              label="מחיר מבצע (₪)"
              type="number"
              step="0.01"
              required
              dir="ltr"
            />
          )}
          <Input name="description" label="תיאור" className="sm:col-span-2" />
          <ProductImageField
            preview={imagePreview}
            onChange={(url) => {
              setImagePreview(url);
              setImageData(url);
            }}
            onError={setError}
          />
          <Button
            type="submit"
            variant="square"
            className="bakery-float-tile sm:col-span-2"
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
                    ₪{p.price.toFixed(2)}
                  </span>
                  <span className="ms-2 text-[16px] font-extrabold text-red-600">
                    ₪{getEffectivePrice(p).toFixed(2)}
                  </span>
                </p>
              ) : (
                <p className="text-[16px] font-extrabold text-bakery-ink">
                  ₪{p.price.toFixed(2)}
                </p>
              )}
              <div className="mt-2 flex items-center justify-center gap-1">
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
            onClick={() => setShowDealForm((v) => !v)}
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
            className="mt-4 grid gap-3 border-t border-bakery-border/20 pt-4 sm:grid-cols-2"
          >
            {dealError && (
              <div className="sm:col-span-2">
                <Alert variant="error">{dealError}</Alert>
              </div>
            )}
            <Input name="name" label="שם הדיל" required className="sm:col-span-2" />
            <label className="text-[14px] font-bold text-bakery-ink">
              מוצר ראשון
              <select
                name="productAId"
                required
                className="mt-1 w-full rounded-xl border border-bakery-border/40 bg-white px-3 py-2"
              >
                <option value="">בחר מוצר</option>
                {activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[14px] font-bold text-bakery-ink">
              מוצר שני
              <select
                name="productBId"
                required
                className="mt-1 w-full rounded-xl border border-bakery-border/40 bg-white px-3 py-2"
              >
                <option value="">בחר מוצר</option>
                {activeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <Input
              name="dealPrice"
              label="מחיר דיל (₪)"
              type="number"
              step="0.01"
              required
              dir="ltr"
            />
            <Input
              name="validUntil"
              label="תקף עד"
              type="datetime-local"
              required
              dir="ltr"
            />
            <Button
              type="submit"
              variant="square"
              className="sm:col-span-2"
              disabled={addingDeal || activeProducts.length < 2}
            >
              {addingDeal ? "שומר..." : "שמור דיל"}
            </Button>
          </form>
        )}

        {activeProducts.length < 2 && (
          <p className="mt-3 text-center text-[13px] text-bakery-muted">
            צריך לפחות 2 מוצרים פעילים ליצירת דיל
          </p>
        )}

        <ul className="mt-4 space-y-3">
          {deals.map((d) => (
            <li
              key={d.id}
              className="bakery-float-tile rounded-[18px] p-3 text-center"
            >
              <p className="text-[16px] font-extrabold text-bakery-ink">{d.name}</p>
              <p className="text-[14px] text-bakery-muted">
                {d.productA.name} + {d.productB.name}
              </p>
              <p className="text-[18px] font-extrabold text-bakery-primary">
                ₪{d.dealPrice.toFixed(2)}
              </p>
              <p className="text-[12px] text-bakery-muted">
                עד {new Date(d.validUntil).toLocaleString("he-IL")}
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
