import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const tileClassName =
  "dashboard-action-square dashboard-action-row relative flex aspect-square w-full min-w-0 max-w-full flex-col items-center justify-center gap-3 self-center rounded-[22px] px-2 py-4 text-center transition sm:gap-3.5 sm:px-3 sm:py-5";

function DashboardActionSquareContent({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <>
      <Icon
        className="h-10 w-10 text-bakery-muted sm:h-12 sm:w-12"
        strokeWidth={1.75}
      />
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
      >
        <DashboardActionSquareContent icon={icon} label={label} />
      </button>
    );
  }

  if (!href) {
    throw new Error("DashboardActionSquare requires href or onClick");
  }

  return (
    <Link href={href} className={className}>
      <DashboardActionSquareContent icon={icon} label={label} />
    </Link>
  );
}
