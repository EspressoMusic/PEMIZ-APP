"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MODES = [
  { href: "/dev/seller", label: "חנות מוצרים", match: "/dev/seller" },
  {
    href: "/dev/seller-appointments",
    label: "חנות פגישות",
    match: "/dev/seller-appointments",
  },
  {
    href: "/dev/seller-rental",
    label: "חנות השכרה",
    match: "/dev/seller-rental",
  },
] as const;

export function DevPreviewModeSwitch() {
  const pathname = usePathname() ?? "";
  const active =
    [...MODES]
      .sort((a, b) => b.match.length - a.match.length)
      .find((mode) => pathname.startsWith(mode.match))?.match ?? "/dev/seller";

  return (
    <nav
      className="mb-2 flex shrink-0 gap-1.5 rounded-[16px] border border-bakery-border/35 bg-bakery-card/80 p-1 sm:gap-2"
      aria-label="סוג דמו מוכר"
    >
      {MODES.map((mode) => {
        const isActive = active === mode.match;
        return (
          <Link
            key={mode.href}
            href={mode.href}
            className={`flex-1 rounded-[12px] px-1.5 py-2 text-center text-[11px] font-extrabold transition sm:px-2 sm:text-[13px] ${
              isActive
                ? "bg-bakery-primary text-bakery-on-primary shadow-[var(--shadow-bakery-btn)]"
                : "text-bakery-ink hover:bg-bakery-cream-hover"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {mode.label}
          </Link>
        );
      })}
    </nav>
  );
}
