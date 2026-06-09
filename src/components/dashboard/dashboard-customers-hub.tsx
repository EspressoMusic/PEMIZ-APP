"use client";

import { useState } from "react";
import { DASHBOARD_PAGE_ROOT } from "@/components/dashboard/dashboard-panel-frame";
import {
  HelpCircle,
  Megaphone,
  MessageCircle,
  MessagesSquare,
} from "lucide-react";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import {
  DashboardActionRow,
  DashboardActionRowButton,
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
    <>
      <DashboardActionRowButton
        onClick={() => setOpen(true)}
        icon={MessagesSquare}
        title={labels.customerInquiries}
      />
      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={labels.customerInquiries}
        ariaLabel={labels.customerInquiries}
        placement="top"
        showBackButton
        warmPanel
      >
        <ul className="dashboard-settings-style-rows space-y-2 text-start">
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
      </DashboardActionSheet>
    </>
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
    <ul className="dashboard-customers-hub-rows space-y-2 text-start">
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
    <div className="dashboard-card dashboard-hub-panel bakery-float-panel shrink-0 rounded-[32px] p-3">
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
