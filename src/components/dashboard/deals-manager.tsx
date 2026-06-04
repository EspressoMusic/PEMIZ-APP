"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playProductAddedSound } from "@/lib/ui-sounds";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";
import { CelebrationModal } from "@/components/celebration-modal";
import { Button, Input, Badge, Alert } from "@/components/ui";
import { Gift, Plus, X, Pencil } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";

type Product = {
  id: string;
  name: string;
  price: number;
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

type ValidityMode = "1d" | "3d" | "7d" | "14d" | "custom";

function resolveValidUntil(
  mode: ValidityMode,
  customDate: string,
  labels: {
    dealPickDate: string;
    dealDateFuture: string;
  },
  validityOptions: { id: ValidityMode; days?: number }[]
): { ok: true; iso: string } | { ok: false; error: string } {
  if (mode === "custom") {
    if (!customDate) {
      return { ok: false, error: labels.dealPickDate };
    }
    const [y, m, d] = customDate.split("-").map(Number);
    const parsed = new Date(y, m - 1, d, 23, 59, 59, 999);
    if (Number.isNaN(parsed.getTime()) || parsed.getTime() <= Date.now()) {
      return { ok: false, error: labels.dealDateFuture };
    }
    return { ok: true, iso: parsed.toISOString() };
  }
  const opt = validityOptions.find((o) => o.id === mode);
  const days = opt?.days ?? 7;
  return {
    ok: true,
    iso: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function customDateFromIso(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DealsManager() {
  const dealFormRef = useRef<HTMLFormElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealError, setDealError] = useState("");
  const [saving, setSaving] = useState(false);
  const [wizardStep, setWizardStep] = useState<null | "form" | "confirm">(null);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [dealValidityMode, setDealValidityMode] = useState<ValidityMode>("7d");
  const [customValidDate, setCustomValidDate] = useState("");
  const [dealSelectedIds, setDealSelectedIds] = useState<string[]>([]);
  const [showDealProductPicker, setShowDealProductPicker] = useState(false);
  const { labels, locale, formatMoney, formatDateTime } = useAppLocale();
  const dealValidityOptions = useMemo(
    () => [
      { id: "1d" as const, label: labels.periodOneDay, days: 1 },
      { id: "3d" as const, label: labels.periodThreeDays, days: 3 },
      { id: "7d" as const, label: labels.periodOneWeek, days: 7 },
      { id: "14d" as const, label: labels.periodTwoWeeks, days: 14 },
      { id: "custom" as const, label: labels.periodCustom },
    ],
    [labels, locale]
  );
  const [confirmDraft, setConfirmDraft] = useState<{
    name: string;
    dealPrice: number;
    validUntil: string;
    validityLabel: string;
  } | null>(null);
  const [dealSuccessOpen, setDealSuccessOpen] = useState(false);
  const [dealSuccessName, setDealSuccessName] = useState("");

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

  function resetWizard() {
    setWizardStep(null);
    setEditingDealId(null);
    setDealError("");
    setDealValidityMode("7d");
    setCustomValidDate("");
    setDealSelectedIds([]);
    setShowDealProductPicker(false);
    setConfirmDraft(null);
    dealFormRef.current?.reset();
  }

  function openNewDealForm() {
    resetWizard();
    setWizardStep("form");
  }

  function openEditDeal(deal: Deal) {
    setDealError("");
    setEditingDealId(deal.id);
    setDealSelectedIds((deal.products ?? []).map((p) => p.id));
    setDealValidityMode("custom");
    setCustomValidDate(customDateFromIso(deal.validUntil));
    setShowDealProductPicker(false);
    setConfirmDraft(null);
    setWizardStep("form");
    requestAnimationFrame(() => {
      const form = dealFormRef.current;
      if (!form) return;
      const nameInput = form.elements.namedItem("name") as HTMLInputElement | null;
      const priceInput = form.elements.namedItem("dealPrice") as HTMLInputElement | null;
      if (nameInput) nameInput.value = deal.name;
      if (priceInput) priceInput.value = String(deal.dealPrice);
    });
  }

  function addProductToDeal(productId: string) {
    setDealSelectedIds((ids) =>
      ids.includes(productId) ? ids : [...ids, productId]
    );
  }

  function removeProductFromDeal(productId: string) {
    setDealSelectedIds((ids) => ids.filter((id) => id !== productId));
  }

  function goToConfirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDealError("");
    const fd = new FormData(dealFormRef.current!);
    const name = String(fd.get("name") ?? "").trim();
    const dealPrice = Number(fd.get("dealPrice"));

    if (!name) {
      setDealError(labels.dealFillName);
      return;
    }
    if (!Number.isFinite(dealPrice) || dealPrice <= 0) {
      setDealError(labels.dealFillPrice);
      return;
    }
    if (dealSelectedIds.length < 1) {
      setDealError(labels.dealPickProduct);
      return;
    }

    const until = resolveValidUntil(
      dealValidityMode,
      customValidDate,
      labels,
      dealValidityOptions
    );
    if (!until.ok) {
      setDealError(until.error);
      return;
    }

    const validityLabel =
      dealValidityMode === "custom"
        ? formatDateTime(until.iso)
        : (dealValidityOptions.find((o) => o.id === dealValidityMode)?.label ??
          "");

    setConfirmDraft({
      name,
      dealPrice,
      validUntil: until.iso,
      validityLabel,
    });
    setWizardStep("confirm");
  }

  async function confirmAndSave() {
    if (!confirmDraft) return;
    setDealError("");
    setSaving(true);

    const payload = {
      name: confirmDraft.name,
      productIds: dealSelectedIds,
      dealPrice: confirmDraft.dealPrice,
      validUntil: confirmDraft.validUntil,
    };

    const res = editingDealId
      ? await fetch(`/api/dashboard/deals/${editingDealId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/dashboard/deals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setDealError(d.error ?? labels.dealSaveFailed);
      setWizardStep("form");
      return;
    }
    const createdNew = !editingDealId;
    const savedName = confirmDraft.name;
    resetWizard();
    load();
    if (createdNew) {
      setDealSuccessName(savedName);
      playProductAddedSound();
      setDealSuccessOpen(true);
    }
  }

  async function removeDeal(id: string) {
    if (!confirm(labels.confirmDeleteDeal)) return;
    await fetch(`/api/dashboard/deals/${id}`, { method: "DELETE" });
    if (editingDealId === id) resetWizard();
    load();
  }

  const activeProducts = products.filter((p) => p.isActive);
  const selectedProducts = dealSelectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => p != null);

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} pb-2`}>
      <div className={`${DASHBOARD_SCROLL_MAIN} space-y-3`}>
        <div className="bakery-float-panel rounded-[24px] p-4">
          {wizardStep === null && (
            <button
              type="button"
              onClick={openNewDealForm}
              className="bakery-float-tile flex w-full min-h-[56px] items-center justify-center gap-3 rounded-[20px] px-5 py-4"
            >
              <Gift className="h-8 w-8 shrink-0 text-bakery-ink" strokeWidth={1.5} />
              <span className="text-[16px] font-extrabold text-bakery-ink">
                {labels.addDeal}
              </span>
            </button>
          )}

          {wizardStep === "form" && (
            <form
              ref={dealFormRef}
              onSubmit={goToConfirm}
              className="flex w-full flex-col items-stretch gap-3"
            >
              {dealError && <Alert variant="error">{dealError}</Alert>}
              <Input name="name" label={labels.dealName} required />

              <div className="space-y-3 text-center">
                <span className="text-[14px] font-bold text-bakery-ink">
                  {labels.products}
                </span>
                <button
                  type="button"
                  onClick={() => setShowDealProductPicker((v) => !v)}
                  className="bakery-float-tile mx-auto flex w-full max-w-[240px] min-h-[48px] items-center justify-center gap-2 rounded-[16px] px-4 py-3"
                >
                  <Plus className="h-6 w-6 text-bakery-ink" strokeWidth={1.5} />
                  <span className="text-[14px] font-extrabold">{labels.addProduct}</span>
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
                            aria-label={labels.delete}
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
                label={labels.dealPrice}
                type="number"
                step="0.01"
                required
                dir="ltr"
              />
              <div className="space-y-2 text-center">
                <span className="text-[14px] font-bold text-bakery-ink">
                  {labels.dealDate}
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {dealValidityOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDealValidityMode(opt.id)}
                      className={`rounded-full px-3 py-1.5 text-[12px] font-bold transition sm:text-[13px] ${
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
                    label={labels.dealDate}
                    type="date"
                    required
                    dir="ltr"
                    value={customValidDate}
                    onChange={(e) => setCustomValidDate(e.target.value)}
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  type="submit"
                  variant="square"
                  className="bakery-float-tile w-full"
                  disabled={dealSelectedIds.length < 1}
                >
                  {labels.continueToConfirm}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={resetWizard}
                >
                  {labels.cancel}
                </Button>
              </div>
            </form>
          )}

          {wizardStep === "confirm" && confirmDraft && (
            <div className="space-y-4 text-center">
              <p className="text-[15px] font-extrabold text-bakery-ink">
                {labels.confirmBeforeSave}
              </p>
              <div className="bakery-float-tile space-y-2 rounded-[18px] p-4 text-start">
                <p className="text-[16px] font-extrabold text-bakery-ink">
                  {confirmDraft.name}
                </p>
                <p className="text-[14px] text-bakery-muted">
                  {selectedProducts.map((p) => p.name).join(" + ")}
                </p>
                <p className="text-[18px] font-extrabold text-bakery-primary">
                  {formatMoney(confirmDraft.dealPrice)}
                </p>
                <p className="text-[13px] text-bakery-muted">
                  {confirmDraft.validityLabel}
                </p>
                {editingDealId && (
                  <Badge tone="default">{labels.edit}</Badge>
                )}
              </div>
              {dealError && <Alert variant="error">{dealError}</Alert>}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="square"
                  className="bakery-float-tile w-full"
                  disabled={saving}
                  onClick={confirmAndSave}
                >
                  {saving ? labels.saving : labels.confirmAndSave}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={saving}
                  onClick={() => {
                    setDealError("");
                    setWizardStep("form");
                  }}
                >
                  {labels.backToEdit}
                </Button>
              </div>
            </div>
          )}
        </div>

        {deals.length > 0 && (
          <div className="bakery-float-panel rounded-[24px] p-4">
            <ul className="space-y-3">
              {deals.map((d) => (
                <li
                  key={d.id}
                  className="bakery-float-tile rounded-[18px] p-3 text-center"
                >
                  <p className="text-[16px] font-extrabold text-bakery-ink">
                    {d.name}
                  </p>
                  <p className="text-[14px] text-bakery-muted">
                    {(d.products ?? []).map((p) => p.name).join(" + ")}
                  </p>
                  <p className="text-[18px] font-extrabold text-bakery-primary">
                    {formatMoney(d.dealPrice)}
                  </p>
                  <p className="text-[12px] text-bakery-muted">
                    {formatDateTime(d.validUntil)}
                  </p>
                  <div className="mt-2 flex flex-wrap justify-center gap-2">
                    <Badge tone={d.isActive ? "success" : "default"}>
                      {d.isActive ? labels.active : labels.inactive}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <Button
                      type="button"
                      variant="square"
                      className="bakery-float-tile inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 sm:max-w-[160px]"
                      onClick={() => openEditDeal(d)}
                    >
                      <Pencil className="h-4 w-4" strokeWidth={2} />
                      {labels.edit}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-[44px] flex-1 sm:max-w-[160px]"
                      onClick={() => removeDeal(d.id)}
                    >
                      {labels.delete}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <DashboardConfettiBackground active={dealSuccessOpen} />

      <CelebrationModal
        open={dealSuccessOpen}
        onClose={() => setDealSuccessOpen(false)}
        title="הדיל נוסף בהצלחה!"
        subtitle={dealSuccessName || undefined}
        detail="הלקוחות יכולים לממש אותו בעמוד החנות"
        buttonLabel="מעולה"
        closeAriaLabel={labels.close}
      />
    </div>
  );
}
