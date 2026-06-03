import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function DashboardActionSquare({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="bakery-float-tile flex aspect-square flex-col items-center justify-center gap-3 rounded-[20px] px-2 py-4 text-center sm:gap-3.5 sm:px-3 sm:py-5"
    >
      <Icon
        className="h-10 w-10 text-bakery-muted sm:h-12 sm:w-12"
        strokeWidth={1.75}
      />
      <span className="px-0.5 text-[14px] font-extrabold leading-snug text-bakery-ink sm:text-[16px]">
        {label}
      </span>
    </Link>
  );
}
