import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Matches [CustomerTabBody] — 12px top safe area */
export function CustomerTabBody({ children }: { children: ReactNode }) {
  return <div className="pt-3">{children}</div>;
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

/** [SettingsQuickActionSquares] — [ManagerActionSquare] solidFill */
export function QuickActionGrid({
  contactLabel,
  storeLabel,
  contactIcon: ContactIcon,
  storeIcon: StoreIcon,
  onContact,
  onStore,
}: {
  contactLabel: string;
  storeLabel: string;
  contactIcon: LucideIcon;
  storeIcon: LucideIcon;
  onContact: () => void;
  onStore: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <ActionSquare
        icon={ContactIcon}
        label={contactLabel}
        onClick={onContact}
      />
      <ActionSquare icon={StoreIcon} label={storeLabel} onClick={onStore} />
    </div>
  );
}

function ActionSquare({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex aspect-[1.02] flex-col items-center justify-center gap-2 rounded-[20px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-3 bakery-square-shadow transition active:scale-[0.98]"
    >
      <Icon className="h-[30px] w-[30px] text-bakery-ink" strokeWidth={1.5} />
      <span className="text-center text-[17px] font-extrabold leading-tight text-bakery-ink">
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
      <span className="flex shrink-0 items-center justify-center rounded-[14px] bg-bakery-card p-2.5 shadow-[0_3px_6px_rgba(0,0,0,0.12)]">
        <Icon className="h-[26px] w-[26px] text-bakery-ink" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[18px] font-extrabold leading-tight text-bakery-ink">
          {title}
        </p>
        <p className="mt-1 text-[14px] font-semibold leading-[1.35] text-bakery-muted">
          {subtitle}
        </p>
      </div>
      <ChevronRight
        className="h-7 w-7 shrink-0 text-bakery-muted"
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

  return (
    <button type="button" onClick={onClick} className={`${shell} text-left`}>
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

export function ProductGridCard({
  name,
  description,
  price,
  qty,
  onDec,
  onInc,
}: {
  name: string;
  description: string | null;
  price: number;
  qty: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="flex aspect-[0.62] flex-col rounded-[20px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-2 shadow-[0_3px_10px_rgba(0,0,0,0.13)]">
      <div className="flex flex-1 items-center justify-center rounded-[14px] bg-bakery-card text-4xl">
        🧁
      </div>
      <h3 className="mt-2 truncate text-left text-[17px] font-extrabold text-bakery-ink">
        {name}
      </h3>
      {description && (
        <p className="line-clamp-2 text-left text-[15px] leading-[1.45] text-bakery-muted">
          {description}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between pt-2">
        <span className="text-[16px] font-extrabold text-bakery-ink">
          ₪{price.toFixed(2)}
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
