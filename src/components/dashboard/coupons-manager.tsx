"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button, Input, Alert, Toggle } from "@/components/ui";
import { CelebrationModal } from "@/components/celebration-modal";
import { Tag, Plus, Pencil, X } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardActionRowButton } from "@/components/dashboard/dashboard-action-row";
import type { DashboardLabels } from "@/lib/dashboard-messages";
import { useDialogA11y } from "@/hooks/use-dialog-a11y";

type DiscountType = "PERCENTAGE" | "FIXED";

type Coupon = {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxRedemptions: number | null;
  maxRedemptionsPerCustomer: number;
  isActive: boolean;
  autoGrantOnReview: boolean;
  validUntil: string | null;
  _count?: { redemptions: number };
};

function couponDiscountLabel(coupon: Coupon, formatMoney: (n: number) => string) {
  return coupon.discountType === "PERCENTAGE"
    ? `${coupon.discountValue}%`
    : formatMoney(coupon.discountValue);
}

function isCouponExpired(coupon: Coupon) {
  return coupon.validUntil != null && new Date(coupon.validUntil).getTime() < Date.now();
}

function EditorModal({
  open,
  title,
  onClose,
  children,
  footer,
  closeLabel,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  closeLabel: string;
}) {
  const panelRef = useDialogA11y<HTMLDivElement>(open, onClose);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={closeLabel}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="dashboard-modal-card relative max-h-[min(88vh,640px)] w-full max-w-md overflow-y-auto p-5 outline-none"
      >
        <div className="relative px-10 pt-1">
          <h2 className="text-center text-[18px] font-extrabold text-bakery-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute end-0 top-0 rounded-full p-1 text-bakery-muted hover:bg-bakery-card/80"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-3">{children}</div>
        <div className="mt-4 flex flex-wrap gap-2">{footer}</div>
      </div>
    </div>
  );
}

function CouponCard({
  coupon,
  labels,
  formatMoney,
  formatDayDate,
  onEdit,
  onDelete,
}: {
  coupon: Coupon;
  labels: DashboardLabels;
  formatMoney: (n: number) => string;
  formatDayDate: (iso: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const expired = isCouponExpired(coupon);
  const isOn = coupon.isActive && !expired;

  return (
    <li className="dashboard-deal-list-card overflow-hidden rounded-[16px] border border-bakery-border/25 shadow-[0_2px_8px_rgba(78,52,46,0.06)]">
      <div className="px-3 py-2.5">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p dir="ltr" className="text-[16px] font-extrabold tabular-nums text-bakery-primary">
            {coupon.code}
          </p>
          <span
            className={`inline-flex min-h-[26px] shrink-0 items-center rounded-[10px] border px-2 text-[11px] font-extrabold leading-none ${
              isOn
                ? "border-[#43a047]/35 bg-[#43a047]/12 text-[#2e7d32]"
                : "border-[#9a4545]/35 bg-[#9a4545]/10 text-[#9a4545]"
            }`}
          >
            {isOn ? labels.active : labels.dealOff}
          </span>
        </div>
        <div className="space-y-1 text-center">
          <p className="text-[15px] font-extrabold leading-snug text-bakery-ink">
            {couponDiscountLabel(coupon, formatMoney)} {labels.couponDiscountValue}
          </p>
          {coupon.autoGrantOnReview ? (
            <p className="text-[12px] font-bold text-bakery-primary">
              {labels.couponAutoGrantBadge}
            </p>
          ) : null}
          {coupon.validUntil ? (
            <p className="text-[12px] font-semibold text-bakery-muted">
              {labels.couponValidUntil}: {formatDayDate(coupon.validUntil)}
            </p>
          ) : null}
          <p className="text-[12px] font-semibold text-bakery-muted">
            {coupon._count?.redemptions ?? 0}
            {coupon.maxRedemptions != null ? ` / ${coupon.maxRedemptions}` : ""}{" "}
            {labels.couponMaxRedemptionsTotal}
          </p>
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
  );
}

export function CouponsManager({
  previewOnly = false,
  standaloneList = false,
  onStandaloneClose,
}: {
  previewOnly?: boolean;
  standaloneList?: boolean;
  onStandaloneClose?: () => void;
}) {
  const { labels, formatMoney, formatDayDate } = useAppLocale();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [listOpen, setListOpen] = useState(standaloneList);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successCode, setSuccessCode] = useState("");

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [perCustomerUnlimited, setPerCustomerUnlimited] = useState(false);
  const [perCustomerCount, setPerCustomerCount] = useState(1);
  const [totalUnlimited, setTotalUnlimited] = useState(true);
  const [totalCount, setTotalCount] = useState(100);
  const [noExpiry, setNoExpiry] = useState(true);
  const [validUntil, setValidUntil] = useState("");
  const [autoGrantOnReview, setAutoGrantOnReview] = useState(false);

  async function load() {
    if (previewOnly) return;
    const res = await fetch("/api/dashboard/coupons");
    const data = await res.json();
    if (res.ok) setCoupons(data.coupons ?? []);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewOnly]);

  function resetForm() {
    setCode("");
    setDiscountType("PERCENTAGE");
    setDiscountValue("");
    setMinOrderAmount("");
    setPerCustomerUnlimited(false);
    setPerCustomerCount(1);
    setTotalUnlimited(true);
    setTotalCount(100);
    setNoExpiry(true);
    setValidUntil("");
    setAutoGrantOnReview(false);
    setError("");
  }

  function openAdd() {
    resetForm();
    setListOpen(false);
    setAddOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setError("");
    setListOpen(false);
    setDiscountType(coupon.discountType);
    setDiscountValue(String(coupon.discountValue));
    setMinOrderAmount(coupon.minOrderAmount != null ? String(coupon.minOrderAmount) : "");
    const perCustomer = coupon.maxRedemptionsPerCustomer;
    setPerCustomerUnlimited(perCustomer === 0);
    setPerCustomerCount(perCustomer === 0 ? 1 : perCustomer);
    setTotalUnlimited(coupon.maxRedemptions == null);
    setTotalCount(coupon.maxRedemptions ?? 100);
    setNoExpiry(coupon.validUntil == null);
    setValidUntil(coupon.validUntil ? coupon.validUntil.slice(0, 10) : "");
    setAutoGrantOnReview(coupon.autoGrantOnReview);
    setEditingId(coupon.id);
  }

  async function saveNew(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const value = Number(discountValue);
    if (!code.trim()) {
      setError(labels.couponFillCode);
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError(labels.couponFillValue);
      return;
    }

    const payload = {
      code: code.trim(),
      discountType,
      discountValue: value,
      ...(minOrderAmount ? { minOrderAmount: Number(minOrderAmount) } : {}),
      ...(totalUnlimited ? {} : { maxRedemptions: totalCount }),
      maxRedemptionsPerCustomer: perCustomerUnlimited ? 0 : perCustomerCount,
      ...(noExpiry || !validUntil
        ? {}
        : { validUntil: new Date(`${validUntil}T23:59:59`).toISOString() }),
      autoGrantOnReview,
    };

    setSaving(true);
    try {
      if (previewOnly) {
        setCoupons((prev) => [
          {
            id: `preview-${Date.now()}`,
            code: payload.code.toUpperCase(),
            discountType,
            discountValue: value,
            minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
            maxRedemptions: totalUnlimited ? null : totalCount,
            maxRedemptionsPerCustomer: perCustomerUnlimited ? 0 : perCustomerCount,
            isActive: true,
            autoGrantOnReview,
            validUntil:
              noExpiry || !validUntil
                ? null
                : new Date(`${validUntil}T23:59:59`).toISOString(),
            _count: { redemptions: 0 },
          },
          ...(autoGrantOnReview
            ? prev.map((c) => ({ ...c, autoGrantOnReview: false }))
            : prev),
        ]);
        setAddOpen(false);
        if (standaloneList) setListOpen(true);
        setSuccessCode(payload.code.toUpperCase());
        setSuccessOpen(true);
        return;
      }

      const res = await fetch("/api/dashboard/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? labels.couponSaveFailed);
        return;
      }
      setAddOpen(false);
      if (standaloneList) setListOpen(true);
      setSuccessCode(data.coupon.code);
      setSuccessOpen(true);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    const value = Number(discountValue);
    if (!Number.isFinite(value) || value <= 0) {
      setError(labels.couponFillValue);
      return;
    }

    const payload = {
      discountValue: value,
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
      maxRedemptions: totalUnlimited ? null : totalCount,
      maxRedemptionsPerCustomer: perCustomerUnlimited ? 0 : perCustomerCount,
      validUntil:
        noExpiry || !validUntil
          ? null
          : new Date(`${validUntil}T23:59:59`).toISOString(),
      autoGrantOnReview,
    };

    setSaving(true);
    try {
      if (previewOnly) {
        setCoupons((prev) =>
          prev.map((c) => {
            if (c.id === editingId) return { ...c, ...payload };
            return autoGrantOnReview ? { ...c, autoGrantOnReview: false } : c;
          })
        );
        setEditingId(null);
        if (standaloneList) setListOpen(true);
        return;
      }

      const res = await fetch(`/api/dashboard/coupons/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? labels.couponSaveFailed);
        return;
      }
      setEditingId(null);
      if (standaloneList) setListOpen(true);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    if (previewOnly) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
      );
      return;
    }
    await fetch(`/api/dashboard/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !coupon.isActive }),
    });
    await load();
  }

  async function removeCoupon(id: string) {
    if (!confirm(labels.confirmDeleteCoupon)) return;
    if (previewOnly) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      if (editingId === id) setEditingId(null);
      return;
    }
    await fetch(`/api/dashboard/coupons/${id}`, { method: "DELETE" });
    if (editingId === id) setEditingId(null);
    await load();
  }

  const editingCoupon = editingId ? coupons.find((c) => c.id === editingId) : null;

  const redemptionFields = (
    <>
      <div className="space-y-1 text-start">
        <span className="block text-[13px] font-bold text-bakery-ink">
          {labels.couponMaxRedemptionsPerCustomer}
        </span>
        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1">
            <Input
              type="number"
              min={1}
              max={99}
              dir="ltr"
              className="py-2 text-[15px]"
              value={perCustomerCount}
              disabled={perCustomerUnlimited}
              onChange={(e) =>
                setPerCustomerCount(Math.max(1, Math.min(99, Number(e.target.value) || 1)))
              }
            />
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-[12px] border border-bakery-border/35 bg-bakery-input/80 px-2.5 py-2">
            <span className="text-[12px] font-bold leading-tight text-bakery-ink">
              {labels.couponUnlimited}
            </span>
            <Toggle
              enabled={perCustomerUnlimited}
              onChange={setPerCustomerUnlimited}
              ariaLabel={labels.couponUnlimited}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1 text-start">
        <span className="block text-[13px] font-bold text-bakery-ink">
          {labels.couponValidUntil}
        </span>
        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1">
            <Input
              type="date"
              dir="ltr"
              className="py-2 text-[15px]"
              value={validUntil}
              disabled={noExpiry}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-[12px] border border-bakery-border/35 bg-bakery-input/80 px-2.5 py-2">
            <span className="text-[12px] font-bold leading-tight text-bakery-ink">
              {labels.couponNoExpiry}
            </span>
            <Toggle
              enabled={noExpiry}
              onChange={setNoExpiry}
              ariaLabel={labels.couponNoExpiry}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-[12px] border border-bakery-border/35 bg-bakery-input/80 px-3 py-2.5 text-start">
        <div className="min-w-0">
          <span className="block text-[13px] font-bold text-bakery-ink">
            {labels.couponAutoGrantOnReview}
          </span>
          <span className="block text-[11px] font-semibold leading-snug text-bakery-muted">
            {labels.couponAutoGrantOnReviewHint}
          </span>
        </div>
        <Toggle
          enabled={autoGrantOnReview}
          onChange={setAutoGrantOnReview}
          ariaLabel={labels.couponAutoGrantOnReview}
        />
      </div>
    </>
  );

  const couponsListContent = (
    <div className="flex flex-col gap-2.5 text-start">
      <button
        type="button"
        onClick={openAdd}
        className="dashboard-product-list-card w-full overflow-hidden rounded-[14px] p-3 text-center transition hover:brightness-[0.98] active:scale-[0.98]"
      >
        <span className="flex items-center justify-center gap-2">
          <Plus className="h-5 w-5 text-bakery-primary" strokeWidth={1.75} />
          <span className="text-[15px] font-extrabold text-bakery-ink">
            {labels.addCoupon}
          </span>
        </span>
      </button>
      {coupons.length === 0 ? (
        <p className="py-2 text-center text-[14px] text-bakery-muted">
          {labels.noExistingCoupons}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {coupons.map((c) => (
            <CouponCard
              key={c.id}
              coupon={c}
              labels={labels}
              formatMoney={formatMoney}
              formatDayDate={formatDayDate}
              onEdit={() => openEdit(c)}
              onDelete={() => void removeCoupon(c.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );

  const managerBody = (
    <>
      <DashboardActionSheet
        open={listOpen}
        onClose={() => {
          setListOpen(false);
          if (standaloneList) onStandaloneClose?.();
        }}
        ariaLabel={labels.couponsTitle}
        title={standaloneList ? labels.couponsTitle : undefined}
        placement="center"
        showBackButton
        compact
        warmPanel
        panelClassName="dashboard-order-schedule-sheet"
      >
        {couponsListContent}
      </DashboardActionSheet>

      <EditorModal
        open={addOpen}
        title={labels.addCoupon}
        closeLabel={labels.close}
        onClose={() => {
          if (saving) return;
          setAddOpen(false);
          if (standaloneList) setListOpen(true);
        }}
        footer={
          <Button
            type="submit"
            form="coupon-add-form"
            variant="primary"
            className="w-full min-h-[48px] rounded-full font-extrabold"
            disabled={saving}
            aria-busy={saving}
          >
            {saving ? labels.saving : labels.addCoupon}
          </Button>
        }
      >
        <form id="coupon-add-form" onSubmit={saveNew} className="space-y-3">
          {error && <Alert variant="error">{error}</Alert>}
          <Input
            label={labels.couponCode}
            labelClassName="text-[13px]"
            className="py-2 text-[15px] uppercase"
            dir="ltr"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SUMMER10"
            required
          />
          <div className="space-y-1 text-start">
            <span className="block text-[13px] font-bold text-bakery-ink">
              {labels.couponDiscountType}
            </span>
            <div className="flex gap-1.5">
              {(
                [
                  ["PERCENTAGE", labels.couponDiscountPercentage],
                  ["FIXED", labels.couponDiscountFixed],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDiscountType(value)}
                  className={`flex-1 rounded-full px-2.5 py-1.5 text-[13px] font-bold transition ${
                    discountType === value
                      ? "bakery-float-tile--active bg-bakery-primary/15 text-bakery-primary ring-2 ring-bakery-primary/30"
                      : "border border-bakery-border/35 bg-bakery-input/80 text-bakery-ink hover:bg-bakery-card"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <Input
            label={labels.couponDiscountValue}
            labelClassName="text-[13px]"
            className="py-2 text-[15px]"
            type="number"
            step="0.01"
            dir="ltr"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />
          {redemptionFields}
        </form>
      </EditorModal>

      {editingCoupon && (
        <EditorModal
          open={!!editingId}
          title={editingCoupon.code}
          closeLabel={labels.close}
          onClose={() => {
            setEditingId(null);
            setError("");
            if (standaloneList) setListOpen(true);
          }}
          footer={
            <>
              <Button
                type="submit"
                form="coupon-edit-form"
                variant="primary"
                className="flex-1 font-extrabold"
                disabled={saving}
              >
                {saving ? labels.saving : labels.save}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => void toggleActive(editingCoupon)}
              >
                {editingCoupon.isActive ? labels.dealOff : labels.active}
              </Button>
            </>
          }
        >
          <form id="coupon-edit-form" onSubmit={saveEdit} className="space-y-3">
            {error && <Alert variant="error">{error}</Alert>}
            <Input
              label={labels.couponDiscountValue}
              labelClassName="text-[13px]"
              className="py-2 text-[15px]"
              type="number"
              step="0.01"
              dir="ltr"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
            />
            {redemptionFields}
          </form>
        </EditorModal>
      )}

      <CelebrationModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title={labels.couponPublishedSuccess}
        subtitle={successCode || undefined}
        buttonLabel={labels.celebrationOk}
        closeAriaLabel={labels.close}
      />
    </>
  );

  if (standaloneList) return managerBody;

  return (
    <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
      <button
        type="button"
        onClick={() => setListOpen(true)}
        className="dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition"
      >
        <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
          <Tag className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
          {labels.couponsTitle}
          {coupons.length > 0 && (
            <span className="font-semibold text-bakery-muted"> ({coupons.length})</span>
          )}
        </span>
      </button>
      {managerBody}
    </div>
  );
}

export function DashboardCouponsEntry({
  previewOnly = false,
}: {
  previewOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();

  return (
    <>
      <DashboardActionRowButton
        onClick={() => setOpen(true)}
        icon={Tag}
        title={labels.couponsTitle}
        expanded={open}
        active={open}
        tourId="tour-add-coupon"
      />
      {open ? (
        <CouponsManager
          standaloneList
          previewOnly={previewOnly}
          onStandaloneClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
