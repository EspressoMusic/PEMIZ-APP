"use client";

import type { ReactNode } from "react";
import {
  ShoppingBag,
  Receipt,
  MessagesSquare,
  Settings,
  HelpCircle,
  SlidersHorizontal,
  ShieldPlus,
  Calendar,
  CalendarCheck,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";
import type { CustomerLabels } from "./customer-labels";

export type CustomerActionTab =
  | "menu"
  | "orders"
  | "inquiries"
  | "settings"
  | "myAppointments";

type Props = {
  labels: CustomerLabels;
  isAppointments: boolean;
  pageTab: CustomerActionTab | null;
  onOpenTab: (tab: CustomerActionTab) => void;
  onBack: () => void;
  onFaq: () => void;
  onDisplay: () => void;
  onLegal: () => void;
  children: ReactNode;
};

function ActionGridCard({
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex aspect-square flex-col items-center justify-center gap-2 rounded-[20px] bg-[#e6d7bd] px-2 py-4 text-center shadow-[0_3px_10px_rgba(58,47,38,0.1)] transition active:scale-[0.98]"
    >
      {badge != null && badge > 0 && (
        <span className="absolute start-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-bakery-error px-1 text-[10px] font-extrabold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      <Icon className="h-[30px] w-[30px] text-bakery-ink" strokeWidth={1.5} />
      <span className="px-1 text-[13px] font-extrabold leading-tight text-bakery-ink">
        {label}
      </span>
    </button>
  );
}

function ActionMenuRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[22px] bg-[#e3d3b8] px-3 py-3.5 text-start shadow-[0_3px_10px_rgba(58,47,38,0.1)] transition active:scale-[0.99]"
    >
      <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
        <Icon className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-extrabold leading-tight text-bakery-ink">
          {title}
        </span>
        <span className="mt-0.5 block text-[13px] font-medium leading-snug text-bakery-muted">
          {subtitle}
        </span>
      </span>
      <ChevronLeft
        className="h-6 w-6 shrink-0 text-bakery-muted rtl:rotate-180"
        strokeWidth={2}
      />
    </button>
  );
}

export function CustomerStoreActions({
  labels,
  isAppointments,
  pageTab,
  onOpenTab,
  onBack,
  onFaq,
  onDisplay,
  onLegal,
  children,
  cartCount = 0,
}: Props & { cartCount?: number }) {
  if (pageTab) {
    return (
      <div className="space-y-4 pb-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-[14px] font-bold text-bakery-primary"
        >
          <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          {labels.backToActions}
        </button>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-2">
      <div>
        <h1 className="text-[22px] font-extrabold text-bakery-ink">{labels.storeActions}</h1>
      </div>

      <div className="rounded-[24px] border border-bakery-border/20 bg-[#fffbf6] p-4 shadow-[0_4px_18px_rgba(58,47,38,0.07)]">
        <div className="grid grid-cols-2 gap-3">
          {isAppointments ? (
            <>
              <ActionGridCard
                icon={Calendar}
                label={labels.appointments}
                onClick={() => onOpenTab("menu")}
              />
              <ActionGridCard
                icon={CalendarCheck}
                label={labels.myAppointments}
                onClick={() => onOpenTab("myAppointments")}
              />
            </>
          ) : (
            <>
              <ActionGridCard
                icon={ShoppingBag}
                label={labels.buy}
                onClick={() => onOpenTab("menu")}
              />
              <ActionGridCard
                icon={Receipt}
                label={labels.orders}
                badge={cartCount}
                onClick={() => onOpenTab("orders")}
              />
            </>
          )}
          <ActionGridCard
            icon={MessagesSquare}
            label={labels.inquiries}
            onClick={() => onOpenTab("inquiries")}
          />
          <ActionGridCard
            icon={Settings}
            label={labels.settings}
            onClick={() => onOpenTab("settings")}
          />
        </div>
      </div>

      <ul className="space-y-3">
        <li>
          <ActionMenuRow
            icon={HelpCircle}
            title={labels.faq}
            subtitle={labels.faqSub}
            onClick={onFaq}
          />
        </li>
        <li>
          <ActionMenuRow
            icon={SlidersHorizontal}
            title={labels.language}
            subtitle={labels.languageSub}
            onClick={onDisplay}
          />
        </li>
        <li>
          <ActionMenuRow
            icon={ShieldPlus}
            title={labels.legal}
            subtitle={labels.legalSub}
            onClick={onLegal}
          />
        </li>
      </ul>
    </div>
  );
}
