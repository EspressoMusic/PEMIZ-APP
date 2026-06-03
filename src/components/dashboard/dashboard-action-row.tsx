import Link from "next/link";
import { ChevronLeft, type LucideIcon } from "lucide-react";

export function DashboardActionRow({
  href,
  icon: Icon,
  title,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="bakery-float-tile flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start"
      >
        <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
          <Icon className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
          {title}
        </span>
        <ChevronLeft
          className="h-6 w-6 shrink-0 text-bakery-muted rtl:rotate-180"
          strokeWidth={2}
        />
      </Link>
    </li>
  );
}
