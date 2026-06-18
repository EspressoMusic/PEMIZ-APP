"use client";

import Link from "next/link";
import { Home, Store, Tag } from "lucide-react";
import { useMarketingLocale } from "@/components/marketing/marketing-locale-provider";

export type HomeLandingNavTab = "home" | "pricing" | "store";

export function HomeLandingBottomNav({ active }: { active: HomeLandingNavTab }) {
  const { copy } = useMarketingLocale();

  const tabs: {
    id: HomeLandingNavTab;
    href: string;
    label: string;
    icon: typeof Home;
    prefetch?: boolean;
  }[] = [
    { id: "home", href: "/", label: copy.bottomHome, icon: Home },
    { id: "pricing", href: "/pricing", label: copy.bottomPricing, icon: Tag },
    {
      id: "store",
      href: "/seller",
      label: copy.bottomStore,
      icon: Store,
      prefetch: false,
    },
  ];

  return (
    <nav
      className="home-landing-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-bakery-border/25 bg-bakery-card"
      style={{ paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      aria-label="Site"
    >
      <div className="mx-auto flex w-full max-w-lg gap-1 px-2 pt-2 sm:px-3">
        {tabs.map(({ id, href, label, icon: Icon, prefetch }) => {
          const isActive = active === id;
          return (
            <Link
              key={id}
              href={href}
              prefetch={prefetch}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-[44px] min-w-0 flex-1 flex-col items-center justify-center rounded-[16px] border-[2.5px] px-1 py-2 transition ${
                isActive
                  ? "border-bakery-primary bg-bakery-square text-bakery-ink shadow-[0_2px_8px_rgba(58,47,38,0.1)]"
                  : "border-transparent text-bakery-muted"
              }`}
            >
              <Icon
                className={`h-6 w-6 shrink-0 ${isActive ? "text-bakery-ink" : "text-bakery-muted"}`}
                strokeWidth={isActive ? 2.25 : 1.75}
              />
              <span
                className={`mt-1 max-w-full truncate text-[10px] font-bold leading-tight sm:text-[11px] ${
                  isActive ? "text-bakery-ink" : "text-bakery-muted"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
