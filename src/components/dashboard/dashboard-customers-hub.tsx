"use client";

import { useState } from "react";
import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_VIEWPORT_HEIGHT,
} from "@/components/dashboard/dashboard-panel-frame";
import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
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
    <ul className="dashboard-settings-style-rows space-y-2 text-start">
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
    <div
      className={`${DASHBOARD_PAGE_ROOT} ${DASHBOARD_VIEWPORT_HEIGHT} min-h-0 flex-1 text-center`}
    >
      <div className="flex h-full min-h-0 flex-col gap-2">
        <div className="shrink-0 px-1 text-start">
          <DashboardActionsBackLink basePath={basePath} />
        </div>
        <div className="dashboard-card bakery-action-sheet-panel bakery-action-sheet-panel--warm bakery-action-sheet-panel--fullscreen flex min-h-0 flex-1 flex-col overflow-hidden sm:rounded-[32px]">
          <div className="dashboard-action-sheet-body flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
            <DashboardCustomersHubGrid basePath={basePath} embedded />
          </div>
        </div>
      </div>
    </div>
  );
}
