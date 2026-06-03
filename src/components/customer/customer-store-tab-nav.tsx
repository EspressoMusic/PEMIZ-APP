"use client";

import { Home, Receipt, Tag, Settings, type LucideIcon } from "lucide-react";
import type { CustomerLabels } from "./customer-labels";

export type CustomerMainTab = "home" | "orders" | "deals" | "settings";

const TAB_META: {
  id: CustomerMainTab;
  icon: LucideIcon;
  label: (l: CustomerLabels) => string;
}[] = [
  { id: "home", icon: Home, label: (l) => l.home },
  { id: "orders", icon: Receipt, label: (l) => l.orders },
  { id: "deals", icon: Tag, label: (l) => l.deals },
  { id: "settings", icon: Settings, label: (l) => l.settings },
];

export function CustomerStoreTabNav({
  labels,
  active,
  onSelect,
  ordersBadge,
}: {
  labels: CustomerLabels;
  active: CustomerMainTab;
  onSelect: (tab: CustomerMainTab) => void;
  ordersBadge?: number;
}) {
  return (
    <>
      <aside className="sticky top-0 z-30 hidden w-52 shrink-0 lg:block">
        <nav className="flex flex-col gap-1 rounded-[22px] border-[1.2px] border-bakery-border/40 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-sheet p-2 shadow-[var(--shadow-bakery-card)]">
          {TAB_META.map((tab) => (
            <TabNavButton
              key={tab.id}
              active={active === tab.id}
              label={tab.label(labels)}
              icon={tab.icon}
              badge={tab.id === "orders" ? ordersBadge : undefined}
              layout="row"
              onClick={() => onSelect(tab.id)}
            />
          ))}
        </nav>
      </aside>

      <nav
        className="customer-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-bakery-border/25 bg-bakery-card lg:hidden"
        style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
        aria-label={labels.store}
      >
        <div className="mx-auto flex max-w-lg gap-1 px-3 pt-2">
          {TAB_META.map((tab) => (
            <TabNavButton
              key={tab.id}
              active={active === tab.id}
              label={tab.label(labels)}
              icon={tab.icon}
              badge={tab.id === "orders" ? ordersBadge : undefined}
              layout="column"
              onClick={() => onSelect(tab.id)}
            />
          ))}
        </div>
      </nav>
    </>
  );
}

function TabNavButton({
  active,
  label,
  icon: Icon,
  badge,
  layout,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: LucideIcon;
  badge?: number;
  layout: "row" | "column";
  onClick: () => void;
}) {
  const row = layout === "row";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={
        row
          ? `relative flex w-full items-center gap-2 rounded-[14px] px-3 py-2.5 text-[14px] font-bold transition ${
              active
                ? "bg-bakery-primary text-bakery-on-primary shadow-[0_3px_10px_rgba(58,47,38,0.2)]"
                : "text-bakery-muted hover:bg-bakery-primary/10 hover:text-bakery-ink"
            }`
          : `relative flex flex-1 flex-col items-center rounded-[16px] px-1 py-2 transition ${
              active
                ? "bg-bakery-primary text-bakery-on-primary shadow-[0_3px_10px_rgba(58,47,38,0.18)]"
                : "text-bakery-muted"
            }`
      }
    >
      {badge != null && badge > 0 && (
        <span
          className={`absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-bakery-error px-1 text-[9px] font-extrabold text-white ${
            row ? "start-2 top-1.5" : "end-1 top-0.5"
          }`}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <Icon className={row ? "h-[18px] w-[18px] shrink-0" : "h-6 w-6"} strokeWidth={active ? 2.25 : 1.75} />
      <span
        className={
          row
            ? "whitespace-nowrap"
            : `mt-1 max-w-full truncate text-center text-[10px] font-bold leading-tight sm:text-[11px] ${
                active ? "text-bakery-on-primary" : ""
              }`
        }
      >
        {label}
      </span>
    </button>
  );
}
