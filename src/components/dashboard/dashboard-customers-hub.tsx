"use client";

import { useState } from "react";
import { DASHBOARD_PAGE_ROOT } from "@/components/dashboard/dashboard-panel-frame";
import {
  ChevronDown,
  HelpCircle,
  Megaphone,
  MessageCircle,
  MessagesSquare,
} from "lucide-react";
import {
  DASHBOARD_ACTION_ROW_CLASS,
  DashboardActionRow,
} from "@/components/dashboard/dashboard-action-row";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

function DashboardCustomerInquiriesGroup({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();

  return (
    <li className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="dashboard-customer-inquiries-items"
        className={`${DASHBOARD_ACTION_ROW_CLASS}${
          open ? " bakery-float-tile--active" : ""
        }`}
      >
        <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
          <MessagesSquare className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
          {labels.customerInquiries}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          strokeWidth={2.5}
          aria-hidden
        />
      </button>

      {open ? (
        <div id="dashboard-customer-inquiries-items" className="space-y-2 text-start">
          <ul className="space-y-2">
            <DashboardActionRow
              href={`${basePath}/customers/chat`}
              icon={MessageCircle}
              title={labels.customerInquiriesChat}
            />
            <DashboardActionRow
              href={`${basePath}/customers/inquiries`}
              icon={MessagesSquare}
              title={labels.customerInquiriesInbox}
            />
          </ul>
        </div>
      ) : null}
    </li>
  );
}

export function DashboardCustomersHubGrid({
  basePath = "/dashboard",
  embedded = false,
}: {
  basePath?: string;
  /** Inside action sheet — sheet panel is already the frame. */
  embedded?: boolean;
}) {
  const { labels } = useAppLocale();

  const list = (
    <ul className="space-y-2 text-start">
      <DashboardActionRow
        href={`${basePath}/customers/broadcast`}
        icon={Megaphone}
        title={labels.customerMessage}
      />
      <DashboardCustomerInquiriesGroup basePath={basePath} />
      <DashboardActionRow
        href={`${basePath}/faq`}
        icon={HelpCircle}
        title={labels.faq}
      />
    </ul>
  );

  if (embedded) return list;

  return (
    <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
      {list}
    </div>
  );
}

export function DashboardCustomersHub({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  return (
    <div className={`${DASHBOARD_PAGE_ROOT} justify-start pb-2 text-center`}>
      <DashboardCustomersHubGrid basePath={basePath} />
    </div>
  );
}
