"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export const CUSTOMER_CONTACT_MENU_ROW_CLASS =
  "dashboard-action-square dashboard-action-row flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition";

function CustomerContactMenuRowIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
      <Icon className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
    </span>
  );
}

function CustomerContactMenuRowText({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block text-[16px] font-extrabold leading-tight text-bakery-ink">
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

/** Matches seller «פניות לקוחות» panel (.dashboard-settings-style-rows). */
export function CustomerContactMenuList({ children }: { children: ReactNode }) {
  return (
    <ul className="dashboard-settings-style-rows space-y-2 text-start">
      {children}
    </ul>
  );
}

export function CustomerContactMenuRow({
  icon,
  title,
  subtitle,
  onClick,
  href,
  disabled = false,
  iconSlot,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  /** Custom icon area (e.g. WhatsApp green circle). */
  iconSlot?: ReactNode;
}) {
  const iconNode =
    iconSlot ?? (icon ? <CustomerContactMenuRowIcon icon={icon} /> : null);

  const content = (
    <>
      {iconNode}
      <CustomerContactMenuRowText title={title} subtitle={subtitle} />
    </>
  );

  if (disabled) {
    return (
      <li>
        <div
          className={`${CUSTOMER_CONTACT_MENU_ROW_CLASS} pointer-events-none opacity-45`}
          aria-disabled
        >
          {content}
        </div>
      </li>
    );
  }

  if (href) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${CUSTOMER_CONTACT_MENU_ROW_CLASS} no-underline active:scale-[0.99]`}
        >
          {content}
        </a>
      </li>
    );
  }

  if (onClick) {
    return (
      <li>
        <button
          type="button"
          onClick={onClick}
          className={`${CUSTOMER_CONTACT_MENU_ROW_CLASS} active:scale-[0.99]`}
        >
          {content}
        </button>
      </li>
    );
  }

  return (
    <li>
      <div className={CUSTOMER_CONTACT_MENU_ROW_CLASS}>{content}</div>
    </li>
  );
}
