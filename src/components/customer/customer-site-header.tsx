"use client";

import type { LucideIcon } from "lucide-react";

export type SiteNavItem = {
  icon: LucideIcon;
  label: string;
};

export function CustomerSiteHeader({
  businessName,
  description,
  items,
  selectedIndex,
  onSelect,
}: {
  businessName: string;
  description: string | null;
  items: SiteNavItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-bakery-border/25 bg-gradient-to-b from-customer-nav to-customer-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-5 xl:flex-row xl:items-center xl:justify-between xl:gap-8 xl:px-10 xl:py-6">
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-bakery-muted">
            Online store
          </p>
          <h1 className="truncate text-[28px] font-extrabold leading-tight text-bakery-ink xl:text-[32px]">
            {businessName}
          </h1>
          {description && (
            <p className="mt-1 max-w-2xl text-[15px] leading-[1.5] text-bakery-muted">
              {description}
            </p>
          )}
        </div>

        <nav
          className="flex flex-wrap gap-1 rounded-[18px] border border-bakery-border/30 bg-customer-soft p-1.5 shadow-[0_3px_10px_rgba(0,0,0,0.06)]"
          aria-label="Store sections"
        >
          {items.map((item, i) => {
            const selected = i === selectedIndex;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelect(i)}
                aria-current={selected ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-[14px] font-bold transition ${
                  selected
                    ? "bg-customer-nav-active text-bakery-ink shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                    : "text-bakery-muted hover:bg-bakery-card/80 hover:text-bakery-ink"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={selected ? 2.25 : 1.75} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
