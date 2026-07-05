"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  DASHBOARD_PRESSABLE_CLASS,
  getDashboardPressProps,
} from "@/lib/dashboard-press";

const tileClassName = `${DASHBOARD_PRESSABLE_CLASS} dashboard-action-square dashboard-action-row relative flex aspect-square w-full min-w-0 max-w-full flex-col items-center justify-center gap-3 self-center rounded-[22px] px-2 py-4 text-center sm:gap-3.5 sm:px-3 sm:py-5`;

function DashboardActionSquareContent({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <>
      <span className="bakery-icon-tile flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] sm:h-16 sm:w-16">
        <Icon className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={1.75} />
      </span>
      <span className="px-0.5 text-[14px] font-extrabold leading-snug text-bakery-ink sm:text-[16px]">
        {label}
      </span>
    </>
  );
}

export function DashboardActionSquare({
  href,
  onClick,
  icon,
  label,
  active = false,
}: {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  const className = `${tileClassName}${active ? " dashboard-action-square--active" : ""}`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-expanded={active}
        className={className}
        {...getDashboardPressProps<HTMLButtonElement>()}
      >
        <DashboardActionSquareContent icon={icon} label={label} />
      </button>
    );
  }

  if (!href) {
    throw new Error("DashboardActionSquare requires href or onClick");
  }

  return (
    <Link
      href={href}
      className={className}
      {...getDashboardPressProps<HTMLAnchorElement>()}
    >
      <DashboardActionSquareContent icon={icon} label={label} />
    </Link>
  );
}
