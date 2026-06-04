"use client";

import { Home, Receipt, Tag, Settings, type LucideIcon } from "lucide-react";
import type { CustomerLabels } from "./customer-labels";

export type CustomerMainTab = "home" | "orders" | "deals" | "settings";

const TABS: {
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
    <nav
      className="customer-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-bakery-border/25 bg-bakery-card"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label={labels.store}
    >
      <div className="mx-auto flex w-full max-w-[360px] gap-1 px-2 pt-2">
        {TABS.map((tab) => (
          <TabNavButton
            key={tab.id}
            active={active === tab.id}
            label={tab.label(labels)}
            icon={tab.icon}
            badge={tab.id === "orders" ? ordersBadge : undefined}
            onClick={() => onSelect(tab.id)}
          />
        ))}
      </div>
    </nav>
  );
}

function TabNavButton({
  active,
  label,
  icon: Icon,
  badge,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: LucideIcon;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative flex min-w-0 flex-1 flex-col items-center rounded-[16px] px-1 py-2 transition ${
        active
          ? "bg-bakery-primary text-bakery-on-primary shadow-[0_3px_10px_rgba(58,47,38,0.18)]"
          : "text-bakery-muted"
      }`}
    >
      {badge != null && badge > 0 && (
        <span className="absolute end-1 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-bakery-border/50 bg-bakery-card px-1 text-[9px] font-extrabold text-bakery-ink shadow-[0_1px_3px_rgba(58,47,38,0.12)]">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <Icon className="h-6 w-6 shrink-0" strokeWidth={active ? 2.25 : 1.75} />
      <span
        className={`mt-1 max-w-full truncate text-center text-[10px] font-bold leading-tight sm:text-[11px] ${
          active ? "text-bakery-on-primary" : ""
        }`}
      >
        {label}
      </span>
    </button>
  );
}
