"use client";

import type { LucideIcon } from "lucide-react";

export type NavItem = {
  icon: LucideIcon;
  label: string;
};

/** [BakeryBottomBar] — surfaceContainerHighest ≈ customer-nav on calm theme */
export function CustomerBottomBar({
  items,
  selectedIndex,
  onSelect,
}: {
  items: NavItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-customer-nav shadow-[0_-2px_12px_rgba(0,0,0,0.08)] lg:hidden"
      style={{ paddingBottom: "max(6px, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex w-full max-w-[430px] px-2 py-1.5 sm:max-w-[520px] md:max-w-[600px]">
        {items.map((item, i) => {
          const selected = i === selectedIndex;
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelect(i)}
              aria-current={selected ? "page" : undefined}
              className="flex flex-1 flex-col items-center justify-center rounded-[14px] px-0.5 py-2"
              style={{
                backgroundColor: selected ? "var(--customer-nav-active)" : "transparent",
              }}
            >
              <Icon
                className="h-6 w-6 text-bakery-ink"
                strokeWidth={selected ? 2.25 : 1.75}
              />
              <span className="mt-1 max-w-full truncate text-[11px] font-bold text-bakery-ink">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
