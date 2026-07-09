"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  DASHBOARD_PRESSABLE_CLASS,
  getDashboardPressProps,
} from "@/lib/dashboard-press";

export const DASHBOARD_ACTION_ROW_CLASS =
  `${DASHBOARD_PRESSABLE_CLASS} dashboard-action-square dashboard-action-row flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start`;

function DashboardActionRowIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
      <Icon className="h-6 w-6" strokeWidth={1.75} />
    </span>
  );
}

function DashboardActionRowText({
  title,
  subtitle,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  danger?: boolean;
}) {
  return (
    <span className="min-w-0 flex-1">
      <span
        className={`block text-[16px] font-extrabold leading-tight ${
          danger ? "text-bakery-error" : "text-bakery-ink"
        }`}
      >
        {title}
      </span>
      {subtitle ? (
        <span className="mt-0.5 block text-[13px] font-medium text-bakery-muted">
          {subtitle}
        </span>
      ) : null}
    </span>
  );
}

export function DashboardActionRowSectionLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <li>
      <p className="px-1 pb-0.5 pt-2 text-center text-[14px] font-extrabold leading-snug text-bakery-ink first:pt-0">
        {children}
      </p>
    </li>
  );
}

export function DashboardActionRow({
  href,
  icon,
  title,
  subtitle,
  embeddedInPanel = false,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Inside a shared «חשבון וחנות» panel — no outer tile border. */
  embeddedInPanel?: boolean;
}) {
  const content = (
    <>
      <DashboardActionRowIcon icon={icon} />
      <DashboardActionRowText title={title} subtitle={subtitle} />
    </>
  );

  if (embeddedInPanel) {
    return (
      <Link
        href={href}
        className="dashboard-account-settings-panel__row"
        {...getDashboardPressProps<HTMLAnchorElement>()}
      >
        {content}
      </Link>
    );
  }

  return (
    <li>
      <Link
        href={href}
        className={DASHBOARD_ACTION_ROW_CLASS}
        {...getDashboardPressProps<HTMLAnchorElement>()}
      >
        {content}
      </Link>
    </li>
  );
}

export function DashboardActionRowButton({
  onClick,
  icon,
  title,
  subtitle,
  trailing,
  active = false,
  expanded,
  disabled = false,
  danger = false,
  tourId,
}: {
  onClick?: () => void;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  active?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  danger?: boolean;
  tourId?: string;
}) {
  const content = (
    <>
      <DashboardActionRowIcon icon={icon} />
      <DashboardActionRowText title={title} subtitle={subtitle} danger={danger} />
      {trailing}
    </>
  );

  if (disabled) {
    return (
      <li>
        <div
          className={`${DASHBOARD_ACTION_ROW_CLASS} pointer-events-none opacity-45`}
          aria-disabled
        >
          {content}
        </div>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-expanded={expanded}
        data-tour-id={tourId}
        className={`${DASHBOARD_ACTION_ROW_CLASS}${
          active ? " bakery-float-tile--active" : ""
        }`}
        {...getDashboardPressProps<HTMLButtonElement>()}
      >
        {content}
      </button>
    </li>
  );
}
