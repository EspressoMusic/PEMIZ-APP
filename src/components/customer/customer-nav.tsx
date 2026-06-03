"use client";

import type { LucideIcon } from "lucide-react";

export type CustomerNavItem = {
  icon: LucideIcon;
  label: string;
};

/** Same chrome as seller [DashboardNav] — horizontal on phone, column on wide screens */
export function CustomerNav({
  items,
  selectedIndex,
  onSelect,
}: {
  items: CustomerNavItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <aside className="sticky top-0 z-30 w-full shrink-0 bg-bakery-scaffold/95 pb-1 pt-[max(0.25rem,env(safe-area-inset-top))] backdrop-blur-sm lg:static lg:z-auto lg:w-52 lg:bg-transparent lg:pb-0 lg:pt-0 lg:backdrop-blur-none">
      <nav className="no-scrollbar flex flex-nowrap gap-1 overflow-x-auto overscroll-x-contain rounded-[22px] border-[1.2px] border-bakery-border/40 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-sheet p-2 shadow-[var(--shadow-bakery-card)] [-webkit-overflow-scrolling:touch] lg:flex-col lg:overflow-visible">
        {items.map((item, i) => {
          const active = i === selectedIndex;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(i)}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 snap-start items-center gap-2 rounded-[14px] px-3 py-2.5 text-[14px] font-bold transition lg:w-full ${
                active
                  ? "bg-bakery-primary text-bakery-on-primary shadow-[0_3px_10px_rgba(58,47,38,0.2)]"
                  : "text-bakery-muted hover:bg-bakery-primary/10 hover:text-bakery-ink"
              }`}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.25 : 1.75} />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
