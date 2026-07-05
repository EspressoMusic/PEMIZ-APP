"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";
import { CelebrationModal } from "@/components/celebration-modal";
import { ProductImageField } from "@/components/product-image-field";
import { Button, Input, Badge, Alert, Toggle } from "@/components/ui";
import { Gift, Info, Package, Plus, Tags, X, Pencil, ChevronDown } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardActionRowButton } from "@/components/dashboard/dashboard-action-row";
import { DASHBOARD_PAGE_ROOT } from "@/components/dashboard/dashboard-panel-frame";
import { MAX_DEAL_PRODUCT_LINES } from "@/lib/store-deal";

type Product = {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  imageUrl?: string | null;
};

type DealLineSelection = {
  productId: string;
  quantity: number;
};

type Deal = {
  id: string;
  name: string;
  imageUrl?: string | null;
  dealPrice: number;
  validUntil: string;
  isActive: boolean;
  maxRedemptionsPerCustomer?: number;
  products: Product[];
  items?: { productId: string; quantity: number; product: Product }[];
  _count?: { redemptions: number };
};

type ValidityMode = "1d" | "3d" | "7d" | "14d" | "custom";

function maxRedemptionsFromForm(unlimited: boolean, count: number): number {
  if (unlimited) return 0;
  return Math.max(1, Math.min(99, count));
}

function redemptionFormFromMax(max: number | undefined): {
  unlimited: boolean;
  count: number;
} {
  const value = max ?? 1;
  if (value === 0) return { unlimited: true, count: 1 };
  return { unlimited: false, count: value };
}

function redemptionSummaryLabel(
  max: number,
  labels: {
    dealRedemptionOnce: string;
    dealRedemptionUnlimited: string;
    dealRedemptionLimited: string;
  }
) {
  if (max === 0) return labels.dealRedemptionUnlimited;
  if (max === 1) return labels.dealRedemptionOnce;
  return `${max} ${labels.dealRedemptionLimited}`;
}

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

function toPreviewProducts(
  items: {
    id: string;
    name: string;
    price: number;
    isActive?: boolean;
    imageUrl?: string | null;
  }[]
): Product[] {
  return items.map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    isActive: product.isActive ?? true,
    imageUrl: product.imageUrl ?? null,
  }));
}

const AddDealCard = memo(function AddDealCard({
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
      className="dashboard-product-list-card w-full overflow-hidden rounded-[14px] p-0 text-center transition hover:brightness-[0.98] active:scale-[0.98]"
    >
      <div className="flex h-[5.75rem] w-full flex-col items-center justify-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-bakery-border/35 bg-bakery-cream-light/90">
          <Plus className="h-6 w-6 text-bakery-primary" strokeWidth={1.75} />
        </span>
      </div>
      <div className="flex min-h-[4rem] flex-col items-center justify-center gap-1.5 px-2 py-2">
        <p className="text-[18px] font-extrabold leading-snug text-bakery-ink">
          {label}
        </p>
      </div>
    </button>
  );
});

function formatDealProductsSummary(deal: Deal) {
  if ((deal.items ?? []).length > 0) {
    return (deal.items ?? [])
      .map((item) => {
        const name = item.product?.name ?? "";
        const qty = Math.max(1, item.quantity ?? 1);
        return qty > 1 ? `${name} ×${qty}` : name;
      })
      .join(" + ");
  }
  return (deal.products ?? []).map((p) => p.name).join(" + ");
}

function getDealProductLines(deal: Deal) {
  if ((deal.items ?? []).length > 0) {
    return (deal.items ?? []).map((item) => ({
      name: item.product?.name ?? "",
      imageUrl: item.product?.imageUrl ?? null,
      quantity: Math.max(1, item.quantity ?? 1),
    }));
  }
  return deal.products.map((product) => ({
    name: product.name,
    imageUrl: product.imageUrl ?? null,
    quantity: 1,
  }));
}

function DealProductTiles({
  lines,
}: {
  lines: ReturnType<typeof getDealProductLines>;
}) {
  if (lines.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {lines.map((line, index) => (
        <div
          key={`${line.name}-${index}`}
          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px] border border-bakery-border/30 bg-bakery-card shadow-none"
          title={line.quantity > 1 ? `${line.name} ×${line.quantity}` : line.name}
        >
          {line.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={line.imageUrl}
              alt={line.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center">
              <Package className="h-4 w-4 text-bakery-muted" strokeWidth={1.5} />
            </span>
          )}
          {line.quantity > 1 ? (
            <span className="absolute bottom-0.5 end-0.5 rounded-[6px] bg-bakery-ink/75 px-1 text-[9px] font-bold tabular-nums text-white">
              ×{line.quantity}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

const DealListItem = memo(function DealListItem({
  deal: d,
  labels,
  formatMoney,
  formatDateTime,
  onEdit,
  onDelete,
}: {
  deal: Deal;
  labels: ReturnType<typeof useAppLocale>["labels"];
  formatMoney: (n: number) => string;
  formatDateTime: (iso: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const productSummary = formatDealProductsSummary(d);
  const productLines = getDealProductLines(d);

  return (
    <>
      <li className="dashboard-deal-list-card overflow-hidden rounded-[16px] border border-bakery-border/25 shadow-[0_2px_8px_rgba(78,52,46,0.06)]">
        <div className="px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setDetailOpen(true)}
                className="dashboard-deal-info-btn flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bakery-card text-bakery-ink transition hover:bg-bakery-cream-light active:scale-[0.96]"
                aria-label={`${labels.extras} — ${d.name}`}
              >
                <Info className="h-4 w-4" strokeWidth={2.25} />
              </button>
              <p
                dir="ltr"
                className="shrink-0 text-[16px] font-extrabold tabular-nums text-bakery-primary"
              >
                {formatMoney(d.dealPrice)}
              </p>
            </div>
            <span
              className={`inline-flex min-h-[26px] shrink-0 items-center rounded-[10px] border px-2 text-[11px] font-extrabold leading-none ${
                d.isActive
                  ? "border-[#43a047]/35 bg-[#43a047]/12 text-[#2e7d32]"
                  : "border-[#9a4545]/35 bg-[#9a4545]/10 text-[#9a4545]"
              }`}
            >
              {d.isActive ? (
                <span className="inline-flex items-center gap-1">
                  <span
                    className="deal-active-pulse block h-1.5 w-1.5 rounded-full bg-[#43a047]"
                    aria-hidden
                  />
                  {labels.active}
                </span>
              ) : (
                labels.dealOff
              )}
            </span>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-[15px] font-extrabold leading-snug text-bakery-ink">
              {d.name}
            </p>
            <DealProductTiles lines={productLines} />
            {productLines.length === 0 && productSummary ? (
              <p className="text-[12px] font-semibold leading-snug text-bakery-muted">
                {productSummary}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-bakery-border/20 px-3 py-2">
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex min-h-[36px] items-center rounded-[10px] border border-[#9a4545]/30 bg-[#9a4545]/8 px-3 text-[12px] font-extrabold text-[#9a4545] transition active:opacity-75"
          >
            {labels.delete}
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-full bg-bakery-primary px-3 text-[13px] font-extrabold text-bakery-on-primary shadow-none transition active:scale-[0.98]"
          >
            <Pencil className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} />
            {labels.edit}
          </button>
        </div>
      </li>

      <DashboardActionSheet
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={d.name}
        ariaLabel={`${labels.extras} — ${d.name}`}
        placement="center"
        showBackButton
        compact
        fitContent
        warmPanel
        panelClassName="dashboard-order-schedule-sheet"
      >
        <div className="space-y-2.5 text-center">
          {d.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.imageUrl}
              alt=""
              className="mx-auto aspect-[4/3] w-full max-w-[220px] rounded-[14px] object-cover"
            />
          ) : null}
          <div className="rounded-[14px] border border-bakery-border/30 bg-bakery-cream-light/90 px-2.5 py-2 text-center">
            <p className="text-[12px] font-bold text-bakery-muted">
              {labels.status}
            </p>
            <p className="mt-0.5 text-[14px] font-extrabold text-bakery-ink">
              {d.isActive ? labels.active : labels.dealOff}
            </p>
          </div>
          <div className="rounded-[14px] border border-bakery-border/30 bg-bakery-cream-light/90 px-2.5 py-2 text-center">
            <p className="text-[12px] font-bold text-bakery-muted">
              {labels.dealPrice}
            </p>
            <p className="mt-0.5 text-[16px] font-extrabold tabular-nums text-bakery-primary">
              {formatMoney(d.dealPrice)}
            </p>
          </div>
          {productSummary ? (
            <div className="rounded-[14px] border border-bakery-border/30 bg-bakery-cream-light/90 px-2.5 py-2 text-center">
              <p className="text-[12px] font-bold text-bakery-muted">
                {labels.products}
              </p>
              <p className="mt-0.5 text-[14px] font-semibold leading-snug text-bakery-ink">
                {productSummary}
              </p>
            </div>
          ) : null}
          <div className="rounded-[14px] border border-bakery-border/30 bg-bakery-cream-light/90 px-2.5 py-2 text-center">
            <p className="text-[12px] font-bold text-bakery-muted">
              {labels.dealDate}
            </p>
            <p className="mt-0.5 text-[14px] font-extrabold tabular-nums text-bakery-ink">
              {formatDateTime(d.validUntil)}
            </p>
          </div>
          <div className="rounded-[14px] border border-bakery-border/30 bg-bakery-cream-light/90 px-2.5 py-2 text-center">
            <p className="text-[12px] font-bold text-bakery-muted">
              {labels.dealRedemptionLimit}
            </p>
            <p className="mt-0.5 text-[14px] font-extrabold text-bakery-ink">
              {redemptionSummaryLabel(
                d.maxRedemptionsPerCustomer ?? 1,
                labels
              )}
            </p>
          </div>
        </div>
      </DashboardActionSheet>
    </>
  );
});

export function DealsManager({
  previewOnly = false,
  initialProducts,
  initialDeals,
  autoOpenList = false,
  standaloneList = false,
  onStandaloneClose,
}: {
  previewOnly?: boolean;
  initialProducts?: Parameters<typeof toPreviewProducts>[0];
  initialDeals?: Deal[];
  /** פותח ישר את רשימת הדילים (עמוד ייעודי) */
  autoOpenList?: boolean;
  /** מודל בלבד מתפריט דילים והגבלות */
  standaloneList?: boolean;
  onStandaloneClose?: () => void;
} = {}) {
  const dealFormRef = useRef<HTMLFormElement>(null);
  const savingRef = useRef(false);
  const [products, setProducts] = useState<Product[]>(() =>
    previewOnly && initialProducts ? toPreviewProducts(initialProducts) : []
  );
  const [deals, setDeals] = useState<Deal[]>(() =>
    previewOnly && initialDeals ? initialDeals : []
  );
  const [dealError, setDealError] = useState("");
  const [saving, setSaving] = useState(false);
  const [wizardStep, setWizardStep] = useState<null | "form" | "confirm">(null);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [dealValidityMode, setDealValidityMode] = useState<ValidityMode>("7d");
  const [customValidDate, setCustomValidDate] = useState("");
  const [dealSelectedLines, setDealSelectedLines] = useState<DealLineSelection[]>(
    []
  );
  const [quantityEditorId, setQuantityEditorId] = useState<string | null>(null);
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
  const [dealImageUrl, setDealImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [confirmDraft, setConfirmDraft] = useState<{
    name: string;
    imageUrl: string | null;
    dealPrice: number;
    validUntil: string;
    validityLabel: string;
    maxRedemptionsPerCustomer: number;
    redemptionLabel: string;
  } | null>(null);
  const [dealSuccessOpen, setDealSuccessOpen] = useState(false);
  const [dealSuccessName, setDealSuccessName] = useState("");
  const [dealsListOpen, setDealsListOpen] = useState(
    autoOpenList || standaloneList
  );
  const [dealRedemptionUnlimited, setDealRedemptionUnlimited] = useState(false);
  const [dealRedemptionCount, setDealRedemptionCount] = useState(1);
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  const load = useCallback(async () => {
    if (previewOnly) return;
    const [pRes, dRes] = await Promise.all([
      fetch("/api/dashboard/products"),
      fetch("/api/dashboard/deals"),
    ]);
    const pData = await pRes.json();
    const dData = await dRes.json();
    if (pRes.ok) setProducts(pData.products);
    if (dRes.ok) setDeals(dData.deals);
  }, [previewOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeProducts = products.filter((p) => p.isActive);
  const pickerProducts = activeProducts.filter(
    (p) => getDealLineQuantity(p.id) === 0
  );

  function resetWizard() {
    setWizardStep(null);
    setEditingDealId(null);
    setDealError("");
    setDealValidityMode("7d");
    setCustomValidDate("");
    setDealSelectedLines([]);
    setQuantityEditorId(null);
    setDealImageUrl(null);
    setImageUploading(false);
    setConfirmDraft(null);
    setDealRedemptionUnlimited(false);
    setDealRedemptionCount(1);
    setProductPickerOpen(false);
    savingRef.current = false;
    dealFormRef.current?.reset();
  }

  function closeDealForm() {
    resetWizard();
    if (autoOpenList || standaloneList) {
      setDealsListOpen(true);
    }
  }

  function openNewDealForm() {
    resetWizard();
    setDealsListOpen(false);
    setWizardStep("form");
  }

  function openEditDeal(deal: Deal) {
    setDealError("");
    setEditingDealId(deal.id);
    setDealSelectedLines(
      (deal.items ?? []).length > 0
        ? (deal.items ?? []).map((item) => ({
            productId: item.productId,
            quantity: Math.max(1, item.quantity ?? 1),
          }))
        : (deal.products ?? []).map((p) => ({ productId: p.id, quantity: 1 }))
    );
    setQuantityEditorId(null);
    setDealValidityMode("custom");
    setCustomValidDate(customDateFromIso(deal.validUntil));
    setDealImageUrl(deal.imageUrl ?? null);
    const redemption = redemptionFormFromMax(deal.maxRedemptionsPerCustomer);
    setDealRedemptionUnlimited(redemption.unlimited);
    setDealRedemptionCount(redemption.count);
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

  function getDealLineQuantity(productId: string) {
    return (
      dealSelectedLines.find((line) => line.productId === productId)?.quantity ??
      0
    );
  }

  function pickProductForDeal(productId: string) {
    const existing = dealSelectedLines.find(
      (line) => line.productId === productId
    );
    if (existing) {
      setQuantityEditorId(productId);
      return;
    }
    if (dealSelectedLines.length >= MAX_DEAL_PRODUCT_LINES) {
      setDealError(labels.dealMaxProducts);
      return;
    }
    setDealError("");
    setDealSelectedLines((lines) => [...lines, { productId, quantity: 1 }]);
    setQuantityEditorId(productId);
  }

  function setDealLineQuantity(productId: string, quantity: number) {
    if (quantity < 1) {
      removeProductFromDeal(productId);
      return;
    }
    setDealSelectedLines((lines) =>
      lines.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.min(99, quantity) }
          : line
      )
    );
  }

  function removeProductFromDeal(productId: string) {
    setDealSelectedLines((lines) =>
      lines.filter((line) => line.productId !== productId)
    );
    setQuantityEditorId((current) =>
      current === productId ? null : current
    );
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
    if (dealSelectedLines.length < 1) {
      setDealError(labels.dealPickProduct);
      return;
    }
    if (dealSelectedLines.length > MAX_DEAL_PRODUCT_LINES) {
      setDealError(labels.dealMaxProducts);
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

    const maxRedemptions = maxRedemptionsFromForm(
      dealRedemptionUnlimited,
      dealRedemptionCount
    );

    setConfirmDraft({
      name,
      imageUrl: dealImageUrl,
      dealPrice,
      validUntil: until.iso,
      validityLabel,
      maxRedemptionsPerCustomer: maxRedemptions,
      redemptionLabel: redemptionSummaryLabel(maxRedemptions, labels),
    });
    setWizardStep("confirm");
  }

  async function confirmAndSave() {
    if (!confirmDraft || savingRef.current) return;
    savingRef.current = true;
    setDealError("");
    setSaving(true);

    const payload = {
      name: confirmDraft.name,
      imageUrl: confirmDraft.imageUrl,
      items: dealSelectedLines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      })),
      dealPrice: confirmDraft.dealPrice,
      validUntil: confirmDraft.validUntil,
      maxRedemptionsPerCustomer: confirmDraft.maxRedemptionsPerCustomer,
    };

    try {
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

      if (!res.ok) {
        const d = await res.json();
        setDealError(d.error ?? labels.dealSaveFailed);
        setWizardStep("form");
        return;
      }
      const createdNew = !editingDealId;
      const savedName = confirmDraft.name;
      resetWizard();
      if (autoOpenList || standaloneList) {
        setDealsListOpen(true);
      }
      await load();
      if (createdNew) {
        setDealSuccessName(savedName);
        setDealSuccessOpen(true);
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function removeDeal(id: string) {
    if (!confirm(labels.confirmDeleteDeal)) return;
    if (previewOnly) {
      setDeals((prev) => prev.filter((deal) => deal.id !== id));
      if (editingDealId === id) resetWizard();
      return;
    }
    await fetch(`/api/dashboard/deals/${id}`, { method: "DELETE" });
    if (editingDealId === id) resetWizard();
    void load();
  }

  const selectedDealLines = dealSelectedLines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return null;
      return { product, quantity: line.quantity };
    })
    .filter((line): line is { product: Product; quantity: number } => line != null);

  function formatDealLineLabel(name: string, quantity: number) {
    return quantity > 1 ? `${name} ×${quantity}` : name;
  }

  const dealFormOpen = wizardStep !== null;

  const dealsListContent = (
    <div className="flex flex-col gap-2.5 text-start">
      <AddDealCard label={labels.addNewDeal} onClick={openNewDealForm} />
      {deals.length === 0 ? (
        <p className="py-2 text-center text-[14px] text-bakery-muted">
          {labels.noExistingDeals}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {deals.map((d) => (
            <DealListItem
              key={d.id}
              deal={d}
              labels={labels}
              formatMoney={formatMoney}
              formatDateTime={formatDateTime}
              onDelete={() => void removeDeal(d.id)}
              onEdit={() => {
                setDealsListOpen(false);
                openEditDeal(d);
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );

  const dealFormSheet = (
    <DashboardActionSheet
      open={dealFormOpen}
      onClose={closeDealForm}
      title={
        wizardStep === "confirm"
          ? labels.confirmBeforeSave
          : editingDealId
            ? labels.edit
            : labels.addDeal
      }
      ariaLabel={labels.addDeal}
      placement="upper"
      showBackButton
      backButtonOutside
      compact
      fitContent
      warmPanel
      panelClassName="dashboard-deal-form-sheet"
    >
          {wizardStep === "form" && (
            <form
              ref={dealFormRef}
              onSubmit={goToConfirm}
              className="flex w-full flex-col items-stretch gap-1.5 overflow-hidden text-start"
            >
              {dealError && <Alert variant="error">{dealError}</Alert>}
              <Input
                name="name"
                label={labels.dealName}
                labelClassName="text-[13px]"
                className="py-2 text-[15px]"
                required
              />

              <div className="space-y-1 text-start">
                <span className="block text-[13px] font-bold text-bakery-ink">
                  {labels.dealImage}
                </span>
                <ProductImageField
                  preview={dealImageUrl}
                  onChange={setDealImageUrl}
                  onError={setDealError}
                  onUploadingChange={setImageUploading}
                  compact
                />
              </div>

              <div className="space-y-1 text-start">
                <span className="block text-[13px] font-bold text-bakery-ink">
                  {labels.products}
                </span>
                {activeProducts.length === 0 ? (
                  <p className="rounded-[12px] border border-bakery-border/35 bg-bakery-input/80 px-2.5 py-2 text-[12px] font-semibold leading-snug text-bakery-muted">
                    {labels.dealNoActiveProducts}
                  </p>
                ) : (
                  dealSelectedLines.length < MAX_DEAL_PRODUCT_LINES &&
                  pickerProducts.length > 0 && (
                    <div className="dashboard-deal-product-picker dashboard-form-option-row overflow-hidden rounded-[14px]">
                      <button
                        type="button"
                        onClick={() => setProductPickerOpen((open) => !open)}
                        className="flex w-full items-center justify-between gap-2 px-2.5 py-2.5 text-start transition active:opacity-90"
                        aria-expanded={productPickerOpen}
                      >
                        <span className="text-[13px] font-bold text-bakery-ink">
                          {labels.addProduct}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-bakery-ink transition-transform duration-200 ${
                            productPickerOpen ? "rotate-180" : ""
                          }`}
                          strokeWidth={2.25}
                        />
                      </button>
                      <div
                        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                          productPickerOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="min-h-0 overflow-hidden">
                          <ul className="no-scrollbar max-h-[min(40vh,220px)] space-y-1 overflow-y-auto overscroll-contain border-t border-bakery-border/25 px-2 py-2 [-webkit-overflow-scrolling:touch]">
                            {pickerProducts.map((p) => (
                              <li key={p.id}>
                                <button
                                  type="button"
                                  onClick={() => pickProductForDeal(p.id)}
                                  className="flex w-full items-center gap-2.5 rounded-[12px] px-2 py-2 text-start text-[14px] font-extrabold leading-snug text-bakery-ink transition hover:bg-bakery-cream-hover active:scale-[0.99]"
                                >
                                  {p.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={p.imageUrl}
                                      alt=""
                                      className="h-9 w-9 shrink-0 rounded-[8px] object-cover"
                                    />
                                  ) : (
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-bakery-card">
                                      <Package
                                        className="h-4 w-4 text-bakery-muted"
                                        strokeWidth={1.5}
                                      />
                                    </span>
                                  )}
                                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                                  <Plus
                                    className="h-4 w-4 shrink-0 text-bakery-primary"
                                    strokeWidth={2.5}
                                  />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {dealSelectedLines.length > 0 && (
                  <ul className="space-y-1.5">
                    {selectedDealLines.map(({ product: p, quantity }) => (
                      <li key={p.id} className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantityEditorId((current) =>
                              current === p.id ? null : p.id
                            )
                          }
                          className={`flex w-full items-center gap-2.5 rounded-[12px] border px-2 py-1.5 text-start transition ${
                            quantityEditorId === p.id
                              ? "border-bakery-primary/40 bg-bakery-primary/8"
                              : "border-bakery-border/35 bg-bakery-cream-light"
                          }`}
                        >
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imageUrl}
                              alt=""
                              className="h-11 w-11 shrink-0 rounded-[10px] object-cover"
                            />
                          ) : (
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-bakery-card">
                              <Package
                                className="h-5 w-5 text-bakery-muted"
                                strokeWidth={1.5}
                              />
                            </span>
                          )}
                          <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold text-bakery-ink">
                            {formatDealLineLabel(p.name, quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeProductFromDeal(p.id);
                            }}
                            className="shrink-0 rounded-full p-0.5 text-bakery-muted hover:bg-bakery-card"
                            aria-label={labels.delete}
                          >
                            <X className="h-4 w-4" strokeWidth={2.25} />
                          </button>
                        </button>

                        {quantityEditorId === p.id && (
                          <div className="mx-auto flex w-full max-w-[240px] flex-col items-stretch gap-2">
                            <div className="flex items-center justify-center gap-2 rounded-[12px] border border-bakery-border/35 bg-bakery-input px-2 py-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  setDealLineQuantity(p.id, quantity - 1)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-bakery-border/40 bg-bakery-card text-[18px] font-bold leading-none text-bakery-ink transition active:scale-95"
                                aria-label={labels.delete}
                              >
                                −
                              </button>
                              <span className="min-w-[2rem] text-center text-[16px] font-extrabold tabular-nums text-bakery-ink">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setDealLineQuantity(p.id, quantity + 1)
                                }
                                disabled={quantity >= 99}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-bakery-border/40 bg-bakery-card text-[18px] font-bold leading-none text-bakery-ink transition active:scale-95 disabled:opacity-40"
                                aria-label={labels.addProduct}
                              >
                                +
                              </button>
                            </div>
                            <Button
                              type="button"
                              variant="primary"
                              className="min-h-[40px] w-full rounded-full font-extrabold"
                              onClick={() => setQuantityEditorId(null)}
                            >
                              {labels.confirm}
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Input
                name="dealPrice"
                label={labels.dealPrice}
                labelClassName="text-[13px]"
                className="py-2 text-[15px]"
                type="number"
                step="0.01"
                required
                dir="ltr"
              />
              <div className="space-y-1 text-start">
                <span className="block text-[13px] font-bold text-bakery-ink">
                  {labels.dealRedemptionTimes}
                </span>
                <div className="flex items-stretch gap-2">
                  <div className="min-w-0 flex-1">
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      dir="ltr"
                      className="py-2 text-[15px]"
                      value={dealRedemptionCount}
                      disabled={dealRedemptionUnlimited}
                      onChange={(e) =>
                        setDealRedemptionCount(
                          Math.max(1, Math.min(99, Number(e.target.value) || 1))
                        )
                      }
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-2 rounded-[12px] border border-bakery-border/35 bg-bakery-input/80 px-2.5 py-2">
                    <span className="text-[12px] font-bold leading-tight text-bakery-ink">
                      {labels.dealRedemptionUnlimited}
                    </span>
                    <Toggle
                      enabled={dealRedemptionUnlimited}
                      onChange={setDealRedemptionUnlimited}
                      ariaLabel={labels.dealRedemptionUnlimited}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-start">
                <span className="block text-[13px] font-bold text-bakery-ink">
                  {labels.dealDate}
                </span>
                <div className="flex flex-wrap justify-start gap-1.5">
                  {dealValidityOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDealValidityMode(opt.id)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition sm:text-[12px] ${
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
                    labelClassName="text-[13px]"
                    className="py-2 text-[15px]"
                    type="date"
                    required
                    dir="ltr"
                    value={customValidDate}
                    onChange={(e) => setCustomValidDate(e.target.value)}
                  />
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="mt-0.5 w-full min-h-[40px] rounded-full font-extrabold"
                disabled={
                  dealSelectedLines.length < 1 ||
                  imageUploading ||
                  activeProducts.length === 0
                }
              >
                {labels.continueToConfirm}
              </Button>
            </form>
          )}

          {wizardStep === "confirm" && confirmDraft && (
            <div className="space-y-4 text-start">
              <p className="text-[15px] font-extrabold text-bakery-ink">
                {labels.confirmBeforeSave}
              </p>
              <div className="bakery-float-tile space-y-2 rounded-[18px] p-4 text-start">
                {confirmDraft.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={confirmDraft.imageUrl}
                    alt=""
                    className="mx-auto aspect-[4/3] w-full max-w-[200px] rounded-[14px] object-cover"
                  />
                )}
                <p className="text-[16px] font-extrabold text-bakery-ink">
                  {confirmDraft.name}
                </p>
                <p className="text-[14px] text-bakery-muted">
                  {selectedDealLines
                    .map(({ product, quantity }) =>
                      formatDealLineLabel(product.name, quantity)
                    )
                    .join(" + ")}
                </p>
                <p className="text-[18px] font-extrabold text-bakery-primary">
                  {formatMoney(confirmDraft.dealPrice)}
                </p>
                <p className="text-[13px] text-bakery-muted">
                  {confirmDraft.validityLabel}
                </p>
                <p className="text-[13px] text-bakery-muted">
                  {labels.dealRedemptionLimit}: {confirmDraft.redemptionLabel}
                </p>
                {editingDealId && (
                  <Badge tone="default">{labels.edit}</Badge>
                )}
              </div>
              {dealError && <Alert variant="error">{dealError}</Alert>}
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full min-h-[44px] rounded-full font-extrabold"
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
      </DashboardActionSheet>
  );

  const dealsListSheet = (
    <DashboardActionSheet
      open={dealsListOpen}
      onClose={() => {
        setDealsListOpen(false);
        if (standaloneList) onStandaloneClose?.();
      }}
      ariaLabel={labels.deals}
      placement="center"
      showBackButton
      compact
      expanded={false}
      warmPanel
      panelClassName="dashboard-order-schedule-sheet"
    >
      {dealsListContent}
    </DashboardActionSheet>
  );

  const dealFeedback = (
    <>
      <DashboardConfettiBackground active={dealSuccessOpen} />

      <CelebrationModal
        open={dealSuccessOpen}
        onClose={() => setDealSuccessOpen(false)}
        title={labels.dealPublishedSuccess}
        subtitle={dealSuccessName || undefined}
        detail="הלקוחות יכולים לממש אותו בעמוד החנות"
        buttonLabel="מעולה"
        closeAriaLabel={labels.close}
      />
    </>
  );

  if (standaloneList) {
    return (
      <>
        {dealsListSheet}
        {dealFormSheet}
        {dealFeedback}
      </>
    );
  }

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} gap-2`}>
      {!autoOpenList ? (
        <>
          <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
            <button
              type="button"
              onClick={openNewDealForm}
              className="dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition"
            >
              <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
                <Gift className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
                {labels.addDeal}
              </span>
            </button>
          </div>

          <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
            <button
              type="button"
              onClick={() => {
                resetWizard();
                setDealsListOpen(true);
              }}
              className="dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition"
            >
              <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
                <Tags className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
                {labels.existingDeals}
                {deals.length > 0 && (
                  <span className="font-semibold text-bakery-muted">
                    {" "}
                    ({deals.length})
                  </span>
                )}
              </span>
            </button>
          </div>
        </>
      ) : null}

      {dealFormSheet}
      {dealsListSheet}
      {dealFeedback}
    </div>
  );
}

export function DashboardDealsEntry({
  previewOnly = false,
  initialProducts,
  initialDeals,
}: {
  previewOnly?: boolean;
  initialProducts?: Parameters<typeof toPreviewProducts>[0];
  initialDeals?: Deal[];
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();

  return (
    <>
      <DashboardActionRowButton
        onClick={() => setOpen(true)}
        icon={Gift}
        title={labels.deals}
        expanded={open}
        active={open}
      />
      {open ? (
        <DealsManager
          standaloneList
          previewOnly={previewOnly}
          initialProducts={initialProducts}
          initialDeals={initialDeals}
          onStandaloneClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
