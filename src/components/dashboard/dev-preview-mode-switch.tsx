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
] as const;

export function DevPreviewModeSwitch() {
  const pathname = usePathname() ?? "";
  const active =
    MODES.find((mode) => pathname.startsWith(mode.match))?.match ??
    "/dev/seller";

  return (
    <nav
      className="mb-2 flex shrink-0 gap-2 rounded-[16px] border border-bakery-border/35 bg-bakery-card/80 p-1"
      aria-label="סוג דמו מוכר"
    >
      {MODES.map((mode) => {
        const isActive = active === mode.match;
        return (
          <Link
            key={mode.href}
            href={mode.href}
            className={`flex-1 rounded-[12px] px-2 py-2 text-center text-[12px] font-extrabold transition sm:text-[13px] ${
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
