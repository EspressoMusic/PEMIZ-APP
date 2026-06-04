"use client";

import { Fragment, useState, type ReactNode } from "react";
import { Info, Plus, type LucideIcon } from "lucide-react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { formatCustomerMoney } from "@/lib/customer-money";
import { getEffectivePrice } from "@/lib/product-price";
import { Button } from "@/components/ui";
import { CustomerCenterModal } from "@/components/customer/customer-center-modal";
import type { CustomerLabels } from "./customer-labels";
import type { StoreThemeId } from "@/lib/store-themes";

/** Matches [CustomerTabBody] — 12px top safe area */
export function CustomerTabBody({ children }: { children: ReactNode }) {
  return (
    <div className="pt-[max(0.75rem,env(safe-area-inset-top))]">{children}</div>
  );
}

/** [CatalogEmptyState] + [BakerySquarePalette.shell] borderRadius 16 */
export function EmptyStateCard({ message }: { message: string }) {
  return (
    <div className="px-3 py-6">
      <div
        className="rounded-2xl border-[1.2px] border-bakery-border/45 bg-bakery-square px-4 py-5 bakery-square-shadow"
      >
        <p className="text-center text-[16px] font-bold leading-[1.35] text-bakery-ink">
          {message}
        </p>
      </div>
    </div>
  );
}

const settingsMenuShell =
  "block w-full rounded-[22px] border-[1.2px] border-bakery-border/45 bg-bakery-square bakery-panel-shadow";

/** Settings tab — same row style as other settings items; tap to expand nested rows */
export function SettingsCollapsibleSection({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: LucideIcon;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={`${settingsMenuShell} transition active:scale-[0.99]`}
      >
        <div className="flex items-center gap-3.5 px-[18px] py-3.5">
          <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <Icon className="h-[26px] w-[26px] text-bakery-ink" strokeWidth={1.75} />
          </span>
          <p className="min-w-0 flex-1 text-start text-[18px] font-extrabold leading-tight text-bakery-ink">
            {title}
          </p>
        </div>
      </button>
      {expanded ? <div className="space-y-2">{children}</div> : null}
    </div>
  );
}

/** [BakeryOrdersPanel] / [_OrdersHubSquare] */
export function OrdersHubPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[22px] border-[1.2px] border-bakery-border/45 bg-bakery-square px-3 py-2.5 bakery-panel-shadow">
      <h3 className="text-center text-[17px] font-extrabold text-bakery-ink">
        {title}
      </h3>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

/** [_OrdersPanel] wrapper — soft cream backdrop for quick-action grid */
export function SoftWrapPanel({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[22px] border-[1.2px] border-bakery-border/35 bg-customer-soft p-3 bakery-panel-shadow">
      {children}
    </div>
  );
}

/** Quick actions — customer: contact seller + shop (seller panel uses similar grid) */
export function QuickActionGrid({
  contactLabel,
  buyLabel,
  contactIcon: ContactIcon,
  buyIcon: BuyIcon,
  onContact,
  onBuy,
}: {
  contactLabel: string;
  buyLabel: string;
  contactIcon: LucideIcon;
  buyIcon: LucideIcon;
  onContact: () => void;
  onBuy: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <ActionSquare
        icon={ContactIcon}
        label={contactLabel}
        onClick={onContact}
        compactLabel
      />
      <ActionSquare icon={BuyIcon} label={buyLabel} onClick={onBuy} />
    </div>
  );
}

function ActionSquare({
  icon: Icon,
  label,
  onClick,
  compactLabel = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  compactLabel?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex aspect-[1.02] flex-col items-center justify-center gap-2 rounded-[20px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-3 bakery-square-shadow transition active:scale-[0.98]"
    >
      <Icon className="h-[30px] w-[30px] text-bakery-ink" strokeWidth={1.5} />
      <span
        className={`text-center font-extrabold leading-tight text-bakery-ink ${
          compactLabel ? "px-1 text-[13px] leading-snug" : "text-[17px]"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

/** [_SettingsMenuItem] → [_SettingsMenuRow] inside [_OrdersPanel] */
export function SettingsMenuRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
  href,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <div
      className={`flex items-center gap-3.5 px-[18px] ${subtitle ? "py-4" : "py-3.5"}`}
    >
      <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
        <Icon className="h-[26px] w-[26px] text-bakery-ink" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 text-start">
        <p className="text-[18px] font-extrabold leading-tight text-bakery-ink">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-1 text-[14px] font-semibold leading-[1.35] text-bakery-muted">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );

  const shell = "block w-full rounded-[22px] border-[1.2px] border-bakery-border/45 bg-bakery-square bakery-panel-shadow";

  if (href) {
    return (
      <a href={href} className={`${shell} no-underline`}>
        {content}
      </a>
    );
  }

  if (!onClick) {
    return <div className={shell}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${shell} w-full cursor-pointer text-start transition active:scale-[0.99]`}
    >
      {content}
    </button>
  );
}

export function CartLineRow({
  name,
  imageUrl,
  qty,
  lineTotal,
  locale,
}: {
  name: string;
  imageUrl?: string | null;
  qty: number;
  lineTotal: number;
  locale: CustomerLocale;
}) {
  return (
    <li className="flex items-center gap-2.5 text-start">
      <ProductThumb
        imageUrl={imageUrl}
        className="h-12 w-12 shrink-0 rounded-[12px]"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-extrabold text-bakery-ink">
          {name}
        </p>
        <p className="text-[13px] font-bold text-bakery-ink">
          × {qty}
        </p>
      </div>
      <span className="shrink-0 text-[14px] font-extrabold text-bakery-ink">
        {formatCustomerMoney(lineTotal, locale)}
      </span>
    </li>
  );
}

export function HubEmptyText({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[80px] items-center justify-center py-2">
      <p className="text-center text-[15px] font-normal leading-[1.35] text-bakery-muted">
        {children}
      </p>
    </div>
  );
}

const PRODUCT_GRID_PLACEHOLDER_EMOJI = "🧁";

/** Fills parent box — fixed footprint for grid cards (square image area). */
function ProductGridImage({
  imageUrl,
  className = "",
}: {
  imageUrl?: string | null;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-bakery-card ${className}`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center text-[2.5rem] leading-none select-none"
          aria-hidden
        >
          {PRODUCT_GRID_PLACEHOLDER_EMOJI}
        </span>
      )}
    </div>
  );
}

/** Wide catalog row for desktop storefront */
function ProductThumb({
  imageUrl,
  className = "",
}: {
  imageUrl?: string | null;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className={`object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center bg-bakery-card text-[2.5rem] leading-none ${className}`}
    >
      {PRODUCT_GRID_PLACEHOLDER_EMOJI}
    </div>
  );
}

export function ProductCatalogRow({
  name,
  description,
  price,
  imageUrl,
  locale,
  qty,
  onDec,
  onInc,
}: {
  name: string;
  description: string | null;
  price: number;
  imageUrl?: string | null;
  locale: CustomerLocale;
  qty: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <article className="flex gap-4 rounded-[22px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-4 shadow-[0_3px_10px_rgba(0,0,0,0.1)]">
      <ProductThumb
        imageUrl={imageUrl}
        className="h-[88px] w-[88px] shrink-0 rounded-2xl"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="text-left text-[18px] font-extrabold text-bakery-ink">{name}</h3>
        {description && (
          <p className="mt-1 line-clamp-2 text-left text-[14px] leading-[1.45] text-bakery-muted">
            {description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <span className="text-[18px] font-extrabold text-bakery-ink">
            {formatCustomerMoney(price, locale)}
          </span>
          <div className="flex items-center rounded-2xl border border-bakery-border/40 bg-bakery-card/95">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center text-[16px] font-extrabold text-bakery-ink"
              onClick={onDec}
            >
              −
            </button>
            <span className="min-w-[28px] text-center text-[16px] font-extrabold text-bakery-ink">
              {qty}
            </span>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center text-[16px] font-extrabold text-bakery-ink"
              onClick={onInc}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductGridCard({
  name,
  description,
  price,
  salePrice,
  imageUrl,
  locale,
  storeTheme,
  infoLabel,
  qty,
  outOfStock,
  outOfStockLabel,
  maxQty,
  onDec,
  onInc,
}: {
  name: string;
  description: string | null;
  price: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  locale: CustomerLocale;
  storeTheme: StoreThemeId;
  infoLabel: string;
  qty: number;
  outOfStock?: boolean;
  outOfStockLabel?: string;
  maxQty?: number;
  onDec: () => void;
  onInc: () => void;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const onSale =
    salePrice != null && salePrice > 0 && salePrice < price;
  const display = onSale ? salePrice! : price;

  const atMax = maxQty != null && qty >= maxQty;

  return (
    <>
    <div
      className={`flex h-full min-h-0 flex-col rounded-[16px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-1.5 shadow-[0_3px_10px_rgba(0,0,0,0.13)] ${outOfStock ? "opacity-60" : ""}`}
    >
      <div className="aspect-square w-full shrink-0 overflow-hidden rounded-[12px] bg-bakery-card">
        <ProductThumb
          imageUrl={imageUrl}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="mt-1 flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-1">
          <h3 className="min-w-0 flex-1 truncate text-start text-[14px] font-extrabold text-bakery-ink">
            {name}
          </h3>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-bakery-border/35 bg-bakery-cream-light/95 text-bakery-primary shadow-[0_1px_4px_rgba(58,47,38,0.12)] transition active:scale-95"
            aria-label={infoLabel}
          >
            <Info className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </div>
        <p
          className={`mt-0.5 line-clamp-1 min-h-[14px] text-start text-[11px] leading-[14px] text-bakery-muted ${
            description ? "" : "invisible"
          }`}
        >
          {description || "—"}
        </p>
        <div className="mt-auto flex items-end justify-between gap-1 pt-1.5">
        <span className="flex h-[34px] flex-col items-start justify-end leading-none">
          <span
            className={`text-[11px] font-semibold leading-none line-through ${
              onSale ? "text-bakery-muted" : "invisible"
            }`}
          >
            {formatCustomerMoney(price, locale)}
          </span>
          <span
            className={`text-[15px] font-extrabold leading-none ${
              onSale ? "text-red-600" : "text-bakery-ink"
            }`}
          >
            {formatCustomerMoney(display, locale)}
          </span>
        </span>
        {outOfStock ? (
          <span className="text-[13px] font-bold text-bakery-muted">
            {outOfStockLabel}
          </span>
        ) : (
          <div className="flex items-center rounded-2xl border border-bakery-border/40 bg-bakery-card/95">
            <button
              type="button"
              className="flex h-[26px] w-[26px] items-center justify-center text-[15px] font-extrabold text-bakery-ink disabled:opacity-40"
              onClick={onDec}
              disabled={qty <= 0}
            >
              −
            </button>
            <span
              className={`min-w-[20px] text-center text-[15px] font-extrabold ${
                qty > 0 ? "text-black" : "text-bakery-ink"
              }`}
            >
              {qty}
            </span>
            <button
              type="button"
              className="flex h-[26px] w-[26px] items-center justify-center text-[15px] font-extrabold text-bakery-ink disabled:opacity-40"
              onClick={onInc}
              disabled={atMax}
            >
              +
            </button>
          </div>
        )}
        </div>
      </div>
    </div>

    <CustomerCenterModal
      open={infoOpen}
      onClose={() => setInfoOpen(false)}
      locale={locale}
      storeTheme={storeTheme}
      title={infoLabel}
      bodyClassName="overflow-hidden"
      panelClassName="max-h-fit"
    >
      <div className="space-y-3 px-4 py-4">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-[16px] bg-bakery-card">
          <ProductThumb
            imageUrl={imageUrl}
            className="h-full w-full object-cover"
          />
        </div>
        <h3 className="text-center text-[18px] font-extrabold text-bakery-ink">
          {name}
        </h3>
        {description ? (
          <p className="whitespace-pre-wrap text-center text-[15px] leading-[1.5] text-bakery-ink">
            {description}
          </p>
        ) : (
          <p className="text-center text-[14px] text-bakery-muted">—</p>
        )}
        <div className="flex justify-center gap-2 pt-1">
          {onSale && (
            <span className="text-[15px] font-semibold text-bakery-muted line-through">
              {formatCustomerMoney(price, locale)}
            </span>
          )}
          <span
            className={`text-[18px] font-extrabold ${onSale ? "text-red-600" : "text-bakery-ink"}`}
          >
            {formatCustomerMoney(display, locale)}
          </span>
        </div>
      </div>
    </CustomerCenterModal>
    </>
  );
}

type DealProduct = {
  id?: string;
  name: string;
  imageUrl?: string | null;
  price: number;
  salePrice?: number | null;
};

export function DealCard({
  name,
  dealPrice,
  validUntil,
  products,
  locale,
  labels,
  onRedeem,
  redeemDisabled,
}: {
  name: string;
  dealPrice: number;
  validUntil: string;
  products: DealProduct[];
  locale: CustomerLocale;
  labels: CustomerLabels;
  onRedeem: () => void;
  redeemDisabled?: boolean;
}) {
  const originalTotal = products.reduce(
    (s, p) => s + getEffectivePrice(p),
    0
  );
  const until = new Date(validUntil).toLocaleDateString(
    locale === "he" ? "he-IL" : "en-GB"
  );

  return (
    <article className="flex flex-col gap-1.5 rounded-[16px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-2.5 shadow-[0_2px_8px_rgba(58,47,38,0.1)]">
      <h3 className="line-clamp-2 min-h-[2.35rem] text-center text-[13px] font-extrabold leading-[1.25] text-bakery-ink">
        {name}
      </h3>

      <div className="flex h-10 flex-nowrap items-center justify-center gap-1">
        {products.map((p, index) => (
          <Fragment key={p.id ?? p.name}>
            {index > 0 && (
              <Plus
                className="h-3.5 w-3.5 shrink-0 text-bakery-primary"
                strokeWidth={2.5}
                aria-hidden
              />
            )}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-bakery-border/35 bg-bakery-card p-0.5">
              <ProductThumb
                imageUrl={p.imageUrl}
                className="h-full w-full scale-[1.14] rounded-[8px] object-cover"
              />
            </div>
          </Fragment>
        ))}
      </div>

      <div className="flex flex-col items-center gap-0.5 py-0.5">
        <div className="flex flex-wrap items-baseline justify-center gap-1.5">
          <span className="text-[12px] font-semibold text-bakery-muted line-through">
            {formatCustomerMoney(originalTotal, locale)}
          </span>
          <span className="text-[17px] font-extrabold leading-none text-red-600">
            {formatCustomerMoney(dealPrice, locale)}
          </span>
        </div>
        <p className="text-center text-[11px] font-semibold leading-tight text-bakery-muted">
          {labels.dealValidUntil}: {until}
        </p>
      </div>

      <button
        type="button"
        onClick={onRedeem}
        disabled={redeemDisabled}
        className="w-full rounded-[12px] bg-bakery-primary px-2 py-2.5 text-[13px] font-extrabold leading-tight text-bakery-on-primary shadow-[var(--shadow-bakery-btn)] transition hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
      >
        {redeemDisabled ? labels.outOfStock : labels.redeemDeal}
      </button>
    </article>
  );
}
