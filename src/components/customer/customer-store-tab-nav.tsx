"use client";

import { CalendarDays, Package, Receipt, Settings, Tag, type LucideIcon } from "lucide-react";
import type { CustomerLabels } from "./customer-labels";

export type CustomerMainTab = "home" | "orders" | "deals" | "settings";

const TABS: {
  id: CustomerMainTab;
  icon: LucideIcon;
  label: (l: CustomerLabels) => string;
}[] = [
  { id: "home", icon: Package, label: (l) => l.home },
  { id: "orders", icon: Receipt, label: (l) => l.orders },
  { id: "deals", icon: Tag, label: (l) => l.deals },
  { id: "settings", icon: Settings, label: (l) => l.settings },
];

function homeTabIcon(isAppointments: boolean, isRental: boolean): LucideIcon {
  if (isAppointments || isRental) return CalendarDays;
  return Package;
}

function homeTabLabel(
  labels: CustomerLabels,
  isAppointments: boolean,
  isRental: boolean
) {
  if (isRental) return labels.scheduleRental;
  if (isAppointments) return labels.scheduleAppointment;
  return labels.navProducts;
}

export function CustomerStoreTabNav({
  labels,
  active,
  onSelect,
  ordersBadge,
  dealsBadge,
  hideDeals = false,
  hideOrders = false,
  phoneColumn = false,
  isAppointments = false,
  isRental = false,
}: {
  labels: CustomerLabels;
  active: CustomerMainTab;
  onSelect: (tab: CustomerMainTab) => void;
  ordersBadge?: number;
  dealsBadge?: number;
  hideDeals?: boolean;
  /** חנות מוצרים — בלי לשונית הזמנות; העגלה מוצגת בסרגל תחתון */
  hideOrders?: boolean;
  /** בתוך עמודת 360px — לא נמתח על כל רוחב הדסקטופ */
  phoneColumn?: boolean;
  /** חנות פגישות — לשונית הזמנות מוצגת כ«תורים». */
  isAppointments?: boolean;
  /** חנות השכרה — לשונית הזמנות מוצגת כ«השכרות». */
  isRental?: boolean;
}) {
  const tabs = TABS.filter((tab) => {
    if (hideDeals && tab.id === "deals") return false;
    if (hideOrders && tab.id === "orders") return false;
    return true;
  });

  return (
    <nav
      className={
        phoneColumn
          ? "customer-bottom-nav pointer-events-auto relative z-50 w-full shrink-0 border-t border-bakery-border/25 bg-bakery-card"
          : "customer-bottom-nav pointer-events-auto fixed bottom-0 left-0 right-0 z-50 border-t border-bakery-border/25 bg-bakery-card"
      }
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label={labels.store}
    >
      <div
        className={`flex w-full gap-1 px-2 pt-2 ${phoneColumn ? "" : "mx-auto max-w-[360px]"}`}
      >
        {tabs.map((tab) => (
          <TabNavButton
            key={tab.id}
            active={active === tab.id}
            label={
              tab.id === "home"
                ? homeTabLabel(labels, isAppointments, isRental)
                : tab.id === "orders" && isRental
                  ? labels.myRentals
                  : tab.id === "orders" && isAppointments
                    ? labels.appointments
                    : tab.label(labels)
            }
            icon={
              tab.id === "home"
                ? homeTabIcon(isAppointments, isRental)
                : tab.icon
            }
            badge={
              tab.id === "orders"
                ? ordersBadge
                : tab.id === "deals"
                  ? dealsBadge
                  : undefined
            }
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
      className={`relative flex min-w-0 flex-1 flex-col items-center rounded-[16px] border-[2.5px] px-1 py-2 transition ${
        active
          ? "border-bakery-primary bg-bakery-square text-bakery-ink shadow-[0_2px_8px_rgba(58,47,38,0.1)]"
          : "border-transparent text-bakery-muted"
      }`}
    >
      {badge != null && badge > 0 && (
        <span className="absolute end-1 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-bakery-border/50 bg-bakery-card px-1 text-[9px] font-extrabold text-bakery-ink shadow-[0_1px_3px_rgba(58,47,38,0.12)]">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <Icon
        className={`h-6 w-6 shrink-0 ${active ? "text-bakery-ink" : "text-bakery-muted"}`}
        strokeWidth={active ? 2.25 : 1.75}
      />
      <span
        className={`mt-1 max-w-full truncate text-center text-[10px] font-bold leading-tight sm:text-[11px] ${
          active ? "text-bakery-ink" : "text-bakery-muted"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
