"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function CustomerSellerPreviewBack({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <div className="shrink-0 px-1 pb-1.5">
      <Link
        href={href}
        className="customer-seller-preview-back inline-flex min-h-[40px] items-center gap-1 rounded-[9999px] px-3 py-2 text-[14px] font-extrabold text-bakery-ink no-underline transition active:scale-[0.98]"
      >
        <ChevronLeft className="h-5 w-5 shrink-0 rtl:rotate-180" strokeWidth={2.5} />
        <span>{label}</span>
      </Link>
    </div>
  );
}
