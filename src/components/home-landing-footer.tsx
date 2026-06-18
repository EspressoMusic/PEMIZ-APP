"use client";

import Link from "next/link";
import { useMarketingLocale } from "@/components/marketing/marketing-locale-provider";

export function HomeLandingFooter() {
  const { copy } = useMarketingLocale();

  return (
    <footer className="relative z-10 shrink-0 border-t border-bakery-border/25 bg-bakery-scaffold/30 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-[14px] text-bakery-muted backdrop-blur-[3px] sm:py-8">
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
