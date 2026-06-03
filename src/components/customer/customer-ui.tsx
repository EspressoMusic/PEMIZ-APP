import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { formatCustomerMoney } from "@/lib/customer-money";
import { getEffectivePrice } from "@/lib/product-price";
import { Button } from "@/components/ui";
import type { CustomerLabels } from "./customer-labels";

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
      className="flex aspect-[1.02] flex-col items-center justify-center gap-2 rounded-[20px] border-[1.2px] border-bakery-border/45 bg-[#e5d5c0] p-3 bakery-square-shadow transition active:scale-[0.98]"
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
  subtitle: string;
  onClick?: () => void;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3.5 px-[18px] py-4">
      <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
        <Icon className="h-[26px] w-[26px] text-bakery-ink" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 text-start">
        <p className="text-[18px] font-extrabold leading-tight text-bakery-ink">
          {title}
        </p>
        <p className="mt-1 text-[14px] font-semibold leading-[1.35] text-bakery-muted">
          {subtitle}
        </p>
      </div>
      <ChevronRight
        className="h-7 w-7 shrink-0 text-bakery-muted rtl:rotate-180"
        strokeWidth={2}
      />
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

export function HubEmptyText({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[80px] items-center justify-center py-2">
      <p className="text-center text-[15px] font-normal leading-[1.35] text-bakery-muted">
        {children}
      </p>
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
      className={`flex items-center justify-center bg-bakery-card text-4xl ${className}`}
    >
      🧁
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
  qty,
  onDec,
  onInc,
}: {
  name: string;
  description: string | null;
  price: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  locale: CustomerLocale;
  qty: number;
  onDec: () => void;
  onInc: () => void;
}) {
  const onSale =
    salePrice != null && salePrice > 0 && salePrice < price;
  const display = onSale ? salePrice! : price;

  return (
    <div className="flex aspect-[0.62] flex-col rounded-[20px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-2 shadow-[0_3px_10px_rgba(0,0,0,0.13)]">
      <ProductThumb
        imageUrl={imageUrl}
        className="min-h-0 flex-1 rounded-[14px]"
      />
      <h3 className="mt-2 truncate text-left text-[17px] font-extrabold text-bakery-ink">
        {name}
      </h3>
      {description && (
        <p className="line-clamp-2 text-left text-[15px] leading-[1.45] text-bakery-muted">
          {description}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="flex flex-col items-start leading-tight">
          {onSale && (
            <span className="text-[13px] font-semibold text-bakery-muted line-through">
              {formatCustomerMoney(price, locale)}
            </span>
          )}
          <span
            className={`text-[16px] font-extrabold ${onSale ? "text-red-600" : "text-bakery-ink"}`}
          >
            {formatCustomerMoney(display, locale)}
          </span>
        </span>
        <div className="flex items-center rounded-2xl border border-bakery-border/40 bg-bakery-card/95">
          <button
            type="button"
            className="flex h-[26px] w-[26px] items-center justify-center text-[15px] font-extrabold text-bakery-ink"
            onClick={onDec}
          >
            −
          </button>
          <span className="min-w-[20px] text-center text-[16px] font-extrabold text-bakery-ink">
            {qty}
          </span>
          <button
            type="button"
            className="flex h-[26px] w-[26px] items-center justify-center text-[15px] font-extrabold text-bakery-ink"
            onClick={onInc}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

type DealProduct = {
  name: string;
  imageUrl?: string | null;
  price: number;
  salePrice?: number | null;
};

export function DealCard({
  name,
  dealPrice,
  validUntil,
  productA,
  productB,
  locale,
  labels,
  onRedeem,
}: {
  name: string;
  dealPrice: number;
  validUntil: string;
  productA: DealProduct;
  productB: DealProduct;
  locale: CustomerLocale;
  labels: CustomerLabels;
  onRedeem: () => void;
}) {
  const originalTotal =
    getEffectivePrice(productA) + getEffectivePrice(productB);
  const until = new Date(validUntil).toLocaleDateString(
    locale === "he" ? "he-IL" : "en-GB"
  );

  return (
    <div className="rounded-[20px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-3 shadow-[0_3px_10px_rgba(0,0,0,0.13)]">
      <p className="text-[17px] font-extrabold text-bakery-ink">{name}</p>
      <p className="mt-1 text-[13px] font-semibold text-bakery-muted">
        {labels.dealIncludes}: {productA.name} + {productB.name}
      </p>
      <div className="mt-2 flex gap-2">
        <ProductThumb
          imageUrl={productA.imageUrl}
          className="h-14 w-14 shrink-0 rounded-xl"
        />
        <ProductThumb
          imageUrl={productB.imageUrl}
          className="h-14 w-14 shrink-0 rounded-xl"
        />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-[13px] font-semibold text-bakery-muted line-through">
          {formatCustomerMoney(originalTotal, locale)}
        </span>
        <span className="text-[18px] font-extrabold text-red-600">
          {formatCustomerMoney(dealPrice, locale)}
        </span>
      </div>
      <p className="mt-1 text-[12px] font-semibold text-bakery-muted">
        {labels.dealValidUntil}: {until}
      </p>
      <p className="text-[11px] text-bakery-muted">{labels.dealOnce}</p>
      <Button
        type="button"
        variant="square"
        className="mt-3 w-full min-h-[44px]"
        onClick={onRedeem}
      >
        {labels.redeemDeal}
      </Button>
    </div>
  );
}
