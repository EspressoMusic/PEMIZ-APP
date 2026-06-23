"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMarketingLocale } from "./marketing-locale-provider";

export function MarketingVersionSwitch() {
  const pathname = usePathname();
  const isApple = pathname === "/apple";
  const { locale } = useMarketingLocale();

  const label = isApple
    ? locale === "he"
      ? "← חזרה לגרסה המקורית"
      : "← Back to original version"
    : locale === "he"
      ? "נסו גם את הגרסה בסגנון Apple →"
      : "Try the Apple-style version →";

  return (
    <div className="marketing-version-switch" role="navigation" aria-label="Site version">
      <Link href={isApple ? "/" : "/apple"} prefetch={false}>
        {label}
      </Link>
    </div>
  );
}
