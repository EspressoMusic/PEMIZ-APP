"use client";

import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Info, Tag, type LucideIcon } from "lucide-react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { formatCustomerMoney } from "@/lib/customer-money";
import {
  CustomerCenterModal,
  CustomerModalHeaderBar,
} from "@/components/customer/customer-center-modal";
import { getEffectivePrice } from "@/lib/product-price";
import { getCustomerLabels, type CustomerLabels } from "./customer-labels";
import type { StoreThemeId } from "@/lib/store-themes";
import {
  formatCustomerOrderDate,
  type OrderPreviewLine,
} from "@/lib/customer-order-history";
import { formatAppointmentDateTime } from "@/lib/customer-appointment-history";
import { formatRentalPeriodLine } from "@/lib/rental-period";

export type { OrderPreviewLine };

const QUANTITY_STEPPER_MAX = 100;

function clampQuantity(value: number, max: number) {
  return Math.max(0, Math.min(max, value));
}

function parseQuantityInput(raw: string, max: number): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed)) return null;
  return clampQuantity(parsed, max);
}

export function CustomerQuantityStepper({
  qty,
  max = QUANTITY_STEPPER_MAX,
  onDec,
  onInc,
  onChange,
  ariaLabel,
  size = "default",
}: {
  qty: number;
  max?: number;
  onDec: () => void;
  onInc: () => void;
  onChange: (value: number) => void;
  ariaLabel?: string;
  size?: "default" | "compact";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(qty));
  const inputRef = useRef<HTMLInputElement>(null);
  const effectiveMax = Math.min(QUANTITY_STEPPER_MAX, Math.max(0, max));
  const atMax = qty >= effectiveMax;
  const compact = size === "compact";

  useEffect(() => {
    if (!editing) setDraft(String(qty));
  }, [qty, editing]);

  function commitDraft() {
    const next = parseQuantityInput(draft, effectiveMax);
    if (next !== null) onChange(next);
    setEditing(false);
  }

  function beginEdit() {
    setDraft(String(qty));
    setEditing(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }

  const shellClass = compact
    ? "h-[28px] rounded-xl"
    : "h-[34px] rounded-2xl";
  const btnClass = compact
    ? "h-[28px] w-6 text-[14px]"
    : "h-[34px] w-8 text-[17px]";
  const valueClass = compact
    ? "h-[28px] min-w-[1.5rem] text-[14px]"
    : "h-[34px] min-w-[2.5rem] text-[17px]";
  const inputWidthClass = compact ? "w-7" : "w-10";

  return (
    <div
      className={`flex max-w-full shrink-0 items-center border border-bakery-border/40 bg-bakery-card/95 ${shellClass}`}
    >
      <button
        type="button"
        className={`flex items-center justify-center font-extrabold text-bakery-ink disabled:opacity-40 ${btnClass}`}
        onClick={onDec}
        disabled={qty <= 0}
        aria-label="Decrease quantity"
      >
        −
      </button>
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          min={0}
          max={effectiveMax}
          value={draft}
          aria-label={ariaLabel ?? "Quantity"}
          className={`border-0 bg-transparent text-center font-extrabold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${inputWidthClass} ${valueClass} ${
            qty > 0 ? "text-black" : "text-bakery-ink"
          }`}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitDraft();
            }
            if (e.key === "Escape") {
              setEditing(false);
              setDraft(String(qty));
            }
          }}
          onWheel={(e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 1 : -1;
            const next = clampQuantity(qty + delta, effectiveMax);
            onChange(next);
            setDraft(String(next));
          }}
        />
      ) : (
        <button
          type="button"
          onClick={beginEdit}
          aria-label={ariaLabel ?? "Edit quantity"}
          className={`flex items-center justify-center px-0.5 text-center font-extrabold tabular-nums ${valueClass} ${
            qty > 0 ? "text-black" : "text-bakery-ink"
          }`}
        >
          {qty}
        </button>
      )}
      <button
        type="button"
        className={`flex items-center justify-center font-extrabold text-bakery-ink disabled:opacity-40 ${btnClass}`}
        onClick={onInc}
        disabled={atMax}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

/** Matches [CustomerTabBody] — 12px top safe area */
export function CustomerTabBody({ children }: { children: ReactNode }) {
  return (
    <div className="pt-[max(0.75rem,var(--app-safe-top))]">{children}</div>
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
  "block w-full rounded-[22px] border-[1.2px] border-bakery-border/45 bg-[#E6D5B8] bakery-panel-shadow";

const settingsMenuInner =
  "rounded-[14px] border-[3px] border-[#5C4A3E]/22 bg-bakery-card px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]";

const settingsMenuIconBox =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-bakery-border/35 bg-bakery-square shadow-[0_2px_6px_rgba(58,47,38,0.08)]";

/** Active / history order tiles — single light fill + dark stroke */
const orderCardShell =
  "rounded-[18px] border-[2px] border-bakery-primary bg-bakery-card px-3 py-3";

function SettingsMenuInnerRow({
  icon: Icon,
  iconSlot,
  title,
  subtitle,
  trailing,
}: {
  icon?: LucideIcon;
  iconSlot?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className={`${settingsMenuInner} px-3 py-3`}>
      <div className="flex items-center gap-3">
        <span className={iconSlot ? "shrink-0" : settingsMenuIconBox}>
          {iconSlot ??
            (Icon ? (
              <Icon
                className="h-[26px] w-[26px] text-bakery-ink"
                strokeWidth={1.75}
              />
            ) : null)}
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
        {trailing}
      </div>
    </div>
  );
}

function SettingsMenuRowBody({
  icon,
  iconSlot,
  title,
  subtitle,
  trailing,
}: {
  icon?: LucideIcon;
  iconSlot?: ReactNode;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="m-3">
      <SettingsMenuInnerRow
        icon={icon}
        iconSlot={iconSlot}
        title={title}
        subtitle={subtitle}
        trailing={trailing}
      />
    </div>
  );
}

/** Settings / orders — tan shell, cream inner row (matches seller settings group). */
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
    <div className={settingsMenuShell}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full text-start transition active:scale-[0.99]"
      >
        <SettingsMenuRowBody
          icon={Icon}
          title={title}
          trailing={
            <ChevronDown
              className={`h-6 w-6 shrink-0 text-bakery-ink transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
              strokeWidth={2}
              aria-hidden
            />
          }
        />
      </button>
      {expanded ? (
        <div className="space-y-2 px-3 pb-3">{children}</div>
      ) : null}
    </div>
  );
}

/** Nested row inside SettingsCollapsibleSection — same inner style, no extra outer shell. */
export function SettingsMenuSubRow({
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
    <SettingsMenuInnerRow icon={Icon} title={title} subtitle={subtitle} />
  );

  if (href) {
    return (
      <a href={href} className="block no-underline transition active:scale-[0.99]">
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer text-start transition active:scale-[0.99]"
    >
      {content}
    </button>
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
  iconSlot,
  title,
  subtitle,
  onClick,
  href,
  trailing,
  disabled = false,
}: {
  icon?: LucideIcon;
  iconSlot?: ReactNode;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  href?: string;
  trailing?: ReactNode;
  disabled?: boolean;
}) {
  const content = (
    <SettingsMenuRowBody
      icon={Icon}
      iconSlot={iconSlot}
      title={title}
      subtitle={subtitle}
      trailing={trailing}
    />
  );

  if (disabled) {
    return (
      <div
        className={`${settingsMenuShell} pointer-events-none opacity-45`}
        aria-disabled
      >
        {content}
      </div>
    );
  }

  if (href) {
    return (
      <a href={href} className={`${settingsMenuShell} no-underline`}>
        {content}
      </a>
    );
  }

  if (!onClick) {
    return <div className={settingsMenuShell}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${settingsMenuShell} w-full cursor-pointer text-start transition active:scale-[0.99]`}
    >
      {content}
    </button>
  );
}

function CartLineThumb({
  imageUrl,
  isDeal,
}: {
  imageUrl?: string | null;
  isDeal?: boolean;
}) {
  if (imageUrl) {
    return (
      <ProductThumb
        imageUrl={imageUrl}
        className="h-12 w-12 shrink-0 rounded-[12px]"
      />
    );
  }
  if (isDeal) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] border border-bakery-border/35 bg-bakery-square">
        <Tag className="h-6 w-6 text-bakery-primary" strokeWidth={2} aria-hidden />
      </div>
    );
  }
  return (
    <ProductThumb
      imageUrl={null}
      className="h-12 w-12 shrink-0 rounded-[12px]"
    />
  );
}

export function CartLineRow({
  name,
  imageUrl,
  qty,
  lineTotal,
  locale,
  isDeal,
  faded,
}: {
  name: string;
  imageUrl?: string | null;
  qty: number;
  lineTotal: number;
  locale: CustomerLocale;
  isDeal?: boolean;
  faded?: boolean;
}) {
  const subtitle = isDeal
    ? locale === "he"
      ? "מבצע"
      : "Deal"
    : `× ${qty}`;

  return (
    <div
      className={`flex min-h-[3rem] items-center gap-2.5 text-start ${
        faded ? "opacity-45 saturate-[0.65]" : ""
      }`}
    >
      <CartLineThumb imageUrl={imageUrl} isDeal={isDeal} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-extrabold text-bakery-ink">
          {name}
        </p>
        <p
          className={`text-[13px] font-bold ${
            isDeal ? "text-bakery-muted" : "text-bakery-ink"
          }`}
        >
          {subtitle}
        </p>
      </div>
      <span className="shrink-0 text-[14px] font-extrabold text-bakery-ink">
        {formatCustomerMoney(lineTotal, locale)}
      </span>
    </div>
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

export function OrderHistorySummaryRow({
  placedAt,
  total,
  locale,
  onClick,
}: {
  placedAt: string;
  total: number;
  locale: CustomerLocale;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${orderCardShell} w-full text-start transition active:scale-[0.99]`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] font-bold text-bakery-muted">
          {formatCustomerOrderDate(placedAt, locale)}
        </span>
        <span className="text-[16px] font-extrabold text-bakery-ink">
          {formatCustomerMoney(total, locale)}
        </span>
      </div>
    </button>
  );
}

export function AppointmentPreviewCard({
  serviceName,
  startAt,
  endAt,
  rentalMode = false,
  status,
  locale,
  labels,
  onClick,
}: {
  serviceName: string;
  startAt: string;
  endAt?: string;
  rentalMode?: boolean;
  status: string;
  locale: CustomerLocale;
  labels: ReturnType<typeof getCustomerLabels>;
  onClick?: () => void;
}) {
  const whenLabel =
    rentalMode && endAt
      ? formatRentalPeriodLine(startAt, endAt, locale, {
          rentalNight: labels.rentalNight,
          rentalNights: labels.rentalNights,
          rentalDay: labels.rentalDay,
          rentalDays: labels.rentalDays,
        })
      : formatAppointmentDateTime(startAt, locale);

  const content = (
    <>
      <p className="text-[16px] font-extrabold leading-tight text-bakery-ink">
        {serviceName}
      </p>
      <p className="text-[14px] font-semibold text-bakery-muted">
        {whenLabel}
      </p>
      {status === "CANCELLED" ? (
        <p className="text-[12px] font-bold text-bakery-muted">
          {labels.appointmentCancelled}
        </p>
      ) : null}
    </>
  );

  if (!onClick) {
    return <div className={`${orderCardShell} space-y-1.5`}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${orderCardShell} w-full space-y-1.5 text-start transition hover:bg-bakery-cream-light/40 active:scale-[0.99]`}
    >
      {content}
    </button>
  );
}

export function OrderPreviewCard({
  lines,
  locale,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  lines: OrderPreviewLine[];
  locale: CustomerLocale;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}) {
  const showActions = Boolean(onConfirm || onCancel);
  const labels = getCustomerLabels(locale);
  const orderTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  return (
    <div className="space-y-2">
      {lines.map((line, index) => (
        <div key={`${line.name}-${index}`} className={orderCardShell}>
          <CartLineRow
            name={line.name}
            imageUrl={line.imageUrl}
            qty={line.qty}
            lineTotal={line.lineTotal}
            locale={locale}
            isDeal={Boolean(line.dealId)}
          />
        </div>
      ))}
      {lines.length > 0 ? (
        <div className="flex items-center justify-between gap-3 px-1 pt-1">
          <span className="text-[14px] font-bold text-bakery-ink">
            {labels.total}
          </span>
          <span className="text-[17px] font-extrabold text-bakery-ink tabular-nums">
            {formatCustomerMoney(orderTotal, locale)}
          </span>
        </div>
      ) : null}
      {showActions ? (
        <div className="space-y-2 pt-1">
          <div className="flex justify-center gap-1.5">
          {onConfirm ? (
            <button
              type="button"
              className="inline-flex min-h-8 max-w-[9.5rem] flex-1 items-center justify-center rounded-[12px] bg-bakery-primary px-2.5 py-1.5 text-[12px] font-extrabold leading-tight text-bakery-on-primary shadow-[var(--shadow-bakery-btn)] transition hover:opacity-95 active:scale-[0.98]"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          ) : null}
          {onCancel ? (
            <button
              type="button"
              className="inline-flex min-h-8 max-w-[9.5rem] flex-1 items-center justify-center rounded-[12px] border border-bakery-primary bg-transparent px-2.5 py-1.5 text-[12px] font-extrabold leading-tight text-bakery-ink transition hover:bg-bakery-cream-light/80 active:scale-[0.98]"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          ) : null}
          </div>
        </div>
      ) : null}
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
          loading="lazy"
          decoding="async"
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
        loading="lazy"
        decoding="async"
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

/** Swipeable product gallery — up to 4 images; falls back to single imageUrl. */
function ProductGallery({
  imageUrls,
  imageUrl,
  className = "",
  imgClassName = "h-full w-full object-cover",
  interactive = true,
}: {
  imageUrls?: string[] | null;
  imageUrl?: string | null;
  className?: string;
  imgClassName?: string;
  interactive?: boolean;
}) {
  const urls = useMemo(() => {
    if (imageUrls?.length) return imageUrls;
    if (imageUrl) return [imageUrl];
    return [];
  }, [imageUrls, imageUrl]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [urls]);

  if (!urls.length) {
    return (
      <div
        className={`flex items-center justify-center bg-bakery-card text-[2.5rem] leading-none ${className}`}
      >
        {PRODUCT_GRID_PLACEHOLDER_EMOJI}
      </div>
    );
  }

  if (urls.length === 1 || !interactive) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={urls[0]}
        alt=""
        className={`object-cover ${className} ${imgClassName}`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  function step(delta: number) {
    setIdx((current) => (current + delta + urls.length) % urls.length);
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={urls[idx]}
        alt=""
        className={imgClassName}
        loading="lazy"
        decoding="async"
      />
      <button
        type="button"
        className="absolute inset-y-0 start-0 w-1/3"
        aria-label="Previous image"
        onClick={() => step(-1)}
      />
      <button
        type="button"
        className="absolute inset-y-0 end-0 w-1/3"
        aria-label="Next image"
        onClick={() => step(1)}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center gap-1">
        {urls.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i === idx ? "bg-white shadow-sm" : "bg-white/55"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function ProductCatalogRow({
  name,
  description,
  price,
  imageUrl,
  imageUrls,
  locale,
  qty,
  onDec,
  onInc,
}: {
  name: string;
  description: string | null;
  price: number;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  locale: CustomerLocale;
  qty: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <article className="flex gap-4 rounded-[22px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-4 shadow-[0_3px_10px_rgba(0,0,0,0.1)]">
      <ProductGallery
        imageUrls={imageUrls}
        imageUrl={imageUrl}
        className="h-[88px] w-[88px] shrink-0 rounded-2xl"
        imgClassName="h-full w-full object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="text-start text-[18px] font-extrabold text-bakery-ink">{name}</h3>
        {description && (
          <p className="mt-1 line-clamp-2 text-start text-[14px] leading-[1.45] text-bakery-muted">
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

export const ProductGridCard = memo(function ProductGridCard({
  name,
  description,
  price,
  salePrice,
  imageUrl,
  imageUrls,
  locale,
  storeTheme,
  infoLabel,
  qty,
  outOfStock,
  outOfStockLabel,
  maxQty,
  onDec,
  onInc,
  onQtyChange,
}: {
  name: string;
  description: string | null;
  price: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  locale: CustomerLocale;
  storeTheme: StoreThemeId;
  infoLabel: string;
  qty: number;
  outOfStock?: boolean;
  outOfStockLabel?: string;
  maxQty?: number;
  onDec: () => void;
  onInc: () => void;
  onQtyChange: (value: number) => void;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const onSale =
    salePrice != null && salePrice > 0 && salePrice < price;
  const display = onSale ? salePrice! : price;

  const stepperMax = Math.min(
    QUANTITY_STEPPER_MAX,
    maxQty ?? QUANTITY_STEPPER_MAX
  );

  return (
    <>
    <div
      className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[16px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-1.5 shadow-[0_3px_10px_rgba(0,0,0,0.13)] ${outOfStock ? "opacity-60" : ""}`}
    >
      <div className="aspect-square w-full shrink-0 overflow-hidden rounded-[12px] bg-bakery-card">
        <ProductGallery
          imageUrls={imageUrls}
          imageUrl={imageUrl}
          className="h-full w-full"
          imgClassName="h-full w-full object-cover"
        />
      </div>
      <div className="mt-1.5 flex min-h-[5.5rem] flex-1 flex-col">
        <div className="grid h-8 shrink-0 grid-cols-[minmax(0,1fr)_1.75rem] items-center gap-1.5">
          <h3 className="truncate text-start text-[17px] font-extrabold leading-[1.15] text-bakery-ink">
            {name}
          </h3>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="flex h-7 w-7 items-center justify-center justify-self-end rounded-full border border-bakery-border/35 bg-bakery-cream-light/95 text-bakery-primary shadow-[0_1px_4px_rgba(58,47,38,0.12)] transition active:scale-95"
            aria-label={infoLabel}
          >
            <Info className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>
        <div className="mt-auto grid h-8 shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-1">
          <span
            className={`min-w-0 whitespace-nowrap text-[17px] font-extrabold leading-none tabular-nums ${
              onSale ? "text-[#ff4a55]" : "text-bakery-ink"
            }`}
          >
            {formatCustomerMoney(display, locale)}
          </span>
          {outOfStock ? (
            <span className="shrink-0 text-[12px] font-bold text-bakery-muted">
              {outOfStockLabel}
            </span>
          ) : (
            <CustomerQuantityStepper
              qty={qty}
              max={stepperMax}
              onDec={onDec}
              onInc={onInc}
              onChange={onQtyChange}
              ariaLabel={`Quantity for ${name}`}
              size="compact"
            />
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
          <ProductGallery
            imageUrls={imageUrls}
            imageUrl={imageUrl}
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
        </div>
        <h3 className="text-center text-[22px] font-extrabold leading-tight text-bakery-ink">
          {name}
        </h3>
        {description ? (
          <p className="whitespace-pre-wrap text-center text-[17px] leading-[1.5] text-bakery-ink">
            {description}
          </p>
        ) : (
          <p className="text-center text-[16px] text-bakery-muted">—</p>
        )}
        <div className="flex flex-wrap items-baseline justify-center gap-2.5 pt-2">
          {onSale && (
            <span className="text-[20px] font-semibold leading-none text-bakery-muted line-through tabular-nums">
              {formatCustomerMoney(price, locale)}
            </span>
          )}
          <span
            className={`text-[26px] font-extrabold leading-none tabular-nums ${
              onSale ? "text-[#ff4a55]" : "text-bakery-ink"
            }`}
          >
            {formatCustomerMoney(display, locale)}
          </span>
        </div>
      </div>
    </CustomerCenterModal>
    </>
  );
});

type DealProduct = {
  id?: string;
  name: string;
  imageUrl?: string | null;
  price: number;
  salePrice?: number | null;
  quantity?: number;
};

export function DealCard({
  name,
  imageUrl,
  dealPrice,
  validUntil,
  products,
  locale,
  storeTheme,
  labels,
  onRedeem,
  redeemDisabled,
  faded,
}: {
  name: string;
  imageUrl?: string | null;
  dealPrice: number;
  validUntil: string;
  products: DealProduct[];
  locale: CustomerLocale;
  storeTheme: StoreThemeId;
  labels: CustomerLabels;
  onRedeem: () => void;
  redeemDisabled?: boolean;
  faded?: boolean;
}) {
  const [infoOpen, setInfoOpen] = useState(false);
  const originalTotal = products.reduce(
    (sum, product) =>
      sum + getEffectivePrice(product) * Math.max(1, product.quantity ?? 1),
    0
  );
  const validUntilLabel = `${labels.dealValidUntil} ${formatCustomerOrderDate(validUntil, locale)}`;

  return (
    <>
      <article
        className={`relative mx-auto flex w-full max-w-[17.5rem] min-w-0 flex-col gap-2 overflow-hidden rounded-[16px] border-[3px] border-[#3D2E26]/38 bg-bakery-square p-3 shadow-[0_2px_8px_rgba(58,47,38,0.1)] transition-opacity duration-300 ${
          faded ? "opacity-45 saturate-[0.65]" : ""
        }`}
      >
        {imageUrl ? (
          <div className="overflow-hidden rounded-[12px] border border-bakery-border/35 bg-bakery-card">
            <ProductThumb
              imageUrl={imageUrl}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
        ) : null}

        <div className="relative flex min-h-[2.25rem] items-center justify-center px-7">
          <h3 className="line-clamp-2 w-full rounded-[12px] border-2 border-[#3D2E26]/32 bg-bakery-card/50 px-5 py-1.5 text-center text-[15px] font-extrabold leading-[1.2] text-bakery-ink">
            {name}
          </h3>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="absolute end-0 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-bakery-border/35 bg-bakery-cream-light/95 text-bakery-primary shadow-[0_1px_3px_rgba(58,47,38,0.1)] transition active:scale-95"
            aria-label={labels.productInfo}
          >
            <Info className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {products.map((p) => {
            const qty = Math.max(1, p.quantity ?? 1);
            return (
              <div
                key={p.id ?? p.name}
                className="flex min-h-[2.75rem] min-w-0 items-center gap-2 rounded-[12px] border border-bakery-border/35 bg-bakery-card px-2 py-1.5 shadow-[0_2px_6px_rgba(58,47,38,0.1)]"
              >
                <div className="h-10 w-14 shrink-0 overflow-hidden rounded-[8px] bg-bakery-on-primary">
                  <ProductThumb
                    imageUrl={p.imageUrl}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="min-w-0 flex-1 truncate text-start text-[12px] font-bold leading-tight text-bakery-ink">
                  {p.name}
                </p>
                <span className="shrink-0 text-[13px] font-extrabold leading-none text-bakery-primary tabular-nums">
                  ×{qty}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-1 rounded-[12px] border border-bakery-border/35 bg-bakery-card px-3 py-2.5 shadow-[0_2px_6px_rgba(58,47,38,0.08)]">
          {originalTotal > dealPrice && (
            <p className="text-center text-[13px] font-semibold leading-none text-bakery-muted line-through tabular-nums">
              {formatCustomerMoney(originalTotal, locale)}
            </p>
          )}
          <p className="text-center text-[18px] font-extrabold leading-none tabular-nums text-[#ff4a55]">
            {formatCustomerMoney(dealPrice, locale)}
          </p>
          <p className="pt-0.5 text-center text-[11px] font-semibold leading-snug text-bakery-muted">
            {validUntilLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={onRedeem}
          disabled={redeemDisabled || faded}
          className="mx-auto min-h-[34px] w-full max-w-[9rem] rounded-full bg-bakery-primary px-4 py-1.5 text-[12px] font-extrabold leading-tight text-bakery-on-primary shadow-[var(--shadow-bakery-btn)] transition hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
        >
          {faded
            ? labels.dealRedeemed
            : redeemDisabled
              ? labels.outOfStock
              : labels.redeemDeal}
        </button>
      </article>

      <CustomerCenterModal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        locale={locale}
        storeTheme={storeTheme}
        ariaLabel={name}
        header={
          <CustomerModalHeaderBar
            onClose={() => setInfoOpen(false)}
            closeLabel={locale === "he" ? "סגור" : "Close"}
          />
        }
        bodyClassName="overflow-hidden"
        panelClassName="max-h-fit"
      >
        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="rounded-[14px] border border-bakery-border/35 bg-bakery-square px-4 py-3.5 text-center shadow-[0_2px_8px_rgba(58,47,38,0.08)]">
            <h3 className="text-[20px] font-extrabold leading-tight text-bakery-ink">
              {name}
            </h3>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-center text-[12px] font-bold text-bakery-muted">
              {labels.dealIncludes}
            </p>
            {products.map((product) => {
              const qty = Math.max(1, product.quantity ?? 1);
              return (
                <div
                  key={product.id ?? product.name}
                  className="flex min-h-[3.5rem] items-center gap-3 rounded-[14px] border border-bakery-border/35 bg-bakery-card px-3 py-2.5 shadow-[0_3px_10px_rgba(58,47,38,0.1)]"
                >
                  <div className="h-12 w-[4.5rem] shrink-0 overflow-hidden rounded-[10px] bg-bakery-on-primary">
                    <ProductThumb
                      imageUrl={product.imageUrl}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="min-w-0 flex-1 truncate text-start text-[15px] font-bold leading-tight text-bakery-ink">
                    {product.name}
                  </p>
                  <span className="shrink-0 text-[15px] font-extrabold leading-none text-bakery-primary tabular-nums">
                    ×{qty}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-1.5 rounded-[14px] border border-bakery-border/35 bg-bakery-card px-4 py-3.5 shadow-[0_2px_8px_rgba(58,47,38,0.08)]">
            {originalTotal > dealPrice && (
              <p className="text-center text-[17px] font-semibold leading-none text-bakery-muted line-through tabular-nums">
                {formatCustomerMoney(originalTotal, locale)}
              </p>
            )}
            <p className="text-center text-[26px] font-extrabold leading-none tabular-nums text-[#ff4a55]">
              {formatCustomerMoney(dealPrice, locale)}
            </p>
            <p className="pt-0.5 text-center text-[12px] font-semibold leading-snug text-bakery-muted">
              {validUntilLabel}
            </p>
          </div>

          <p className="rounded-[12px] bg-bakery-square/90 px-3 py-2.5 text-center text-[12px] font-medium leading-snug text-bakery-muted">
            {labels.dealOnce}
          </p>

          <button
            type="button"
            onClick={() => {
              setInfoOpen(false);
              onRedeem();
            }}
            disabled={redeemDisabled || faded}
            className="min-h-[44px] w-full rounded-full bg-bakery-primary px-5 py-2.5 text-[14px] font-extrabold leading-tight text-bakery-on-primary shadow-[var(--shadow-bakery-btn)] transition hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
          >
            {faded
              ? labels.dealRedeemed
              : redeemDisabled
                ? labels.outOfStock
                : labels.redeemDeal}
          </button>
        </div>
      </CustomerCenterModal>
    </>
  );
}
