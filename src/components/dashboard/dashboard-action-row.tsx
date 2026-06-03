import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function DashboardActionRow({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="bakery-float-tile flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start"
      >
        <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-extrabold leading-tight text-bakery-ink">
            {title}
          </span>
          {subtitle && (
            <span className="mt-0.5 block text-[13px] font-medium text-bakery-muted">
              {subtitle}
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}
