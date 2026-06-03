"use client";

import Link from "next/link";
import { SquareCard } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardHomeOrdersLink({ href }: { href: string }) {
  const { labels } = useAppLocale();

  return (
    <SquareCard className="bakery-float-tile w-full rounded-[20px] p-2">
      <Link
        href={href}
        className="flex w-full items-center justify-center rounded-[14px] bg-bakery-cream-light px-3 py-2.5 text-center text-[14px] font-extrabold text-bakery-ink transition hover:bg-bakery-cream-hover active:scale-[0.99]"
      >
        {labels.orders}
      </Link>
    </SquareCard>
  );
}
