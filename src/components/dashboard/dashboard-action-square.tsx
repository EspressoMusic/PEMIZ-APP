import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const tileClassName =
  "bakery-float-tile flex aspect-square flex-col items-center justify-center gap-3 rounded-[20px] px-2 py-4 text-center sm:gap-3.5 sm:px-3 sm:py-5";

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
}: {
  href?: string;
  onClick?: () => void;
  icon: LucideIcon;
  label: string;
}) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={tileClassName}>
        <DashboardActionSquareContent icon={icon} label={label} />
      </button>
    );
  }

  if (!href) {
    throw new Error("DashboardActionSquare requires href or onClick");
  }

  return (
    <Link href={href} className={tileClassName}>
      <DashboardActionSquareContent icon={icon} label={label} />
    </Link>
  );
}
