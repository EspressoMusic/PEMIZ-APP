"use client";

import Link from "next/link";
import { useMarketingLocale } from "@/components/marketing/marketing-locale-provider";

export function HomeLandingFooter() {
  const { copy } = useMarketingLocale();

  return (
    <footer className="relative z-10 shrink-0 bg-bakery-scaffold/30 px-4 pt-6 pb-[max(2.75rem,calc(1.25rem+env(safe-area-inset-bottom)))] text-center text-[14px] text-bakery-muted backdrop-blur-[3px] sm:pt-8 sm:pb-[max(3.5rem,calc(1.5rem+env(safe-area-inset-bottom)))]">
      <Link href="/privacy" className="font-medium hover:text-bakery-ink">
        {copy.privacy}
      </Link>
      {" · "}
      <Link href="/terms" className="font-medium hover:text-bakery-ink">
        {copy.terms}
      </Link>
    </footer>
  );
}
