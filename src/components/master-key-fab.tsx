"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound } from "lucide-react";

export function MasterKeyFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/b/") || pathname.startsWith("/master")) {
    return null;
  }

  return (
    <Link
      href="/master"
      className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border-[1.2px] border-bakery-border/50 bg-bakery-square text-bakery-ink shadow-[var(--shadow-bakery-panel)] transition hover:scale-105 hover:bg-bakery-card"
      title="כניסת מפתח"
      aria-label="כניסת מפתח"
    >
      <KeyRound className="h-5 w-5" strokeWidth={2} />
    </Link>
  );
}
