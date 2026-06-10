"use client";

import { useState } from "react";
import { DashboardFullscreenHubShell } from "@/components/dashboard/dashboard-panel-frame";
import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
import { HelpCircle, MessageCircle, MessagesSquare } from "lucide-react";
import { DashboardBroadcastEntry } from "@/components/dashboard/dashboard-store-broadcast";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_RENTAL_BUSINESS,
  DEV_STORE_BUSINESS,
} from "@/lib/dev-preview-data";
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
  const isDevPreview = basePath.startsWith("/dev/");
  const devBroadcast = basePath.startsWith("/dev/seller-rental")
    ? DEV_RENTAL_BUSINESS
    : basePath.startsWith("/dev/seller-appointments")
      ? DEV_APPOINTMENTS_BUSINESS
      : DEV_STORE_BUSINESS;

  const list = (
    <ul className="dashboard-settings-style-rows space-y-2 text-start">
      <DashboardBroadcastEntry
        previewOnly={isDevPreview}
        initialMessage={
          isDevPreview ? (devBroadcast.storeBroadcast ?? "") : ""
        }
        initialSentAt={
          isDevPreview ? (devBroadcast.storeBroadcastAt ?? null) : null
        }
        initialHistory={
          isDevPreview ? (devBroadcast.storeBroadcastHistory ?? []) : []
        }
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
    <DashboardFullscreenHubShell
      backLink={<DashboardActionsBackLink basePath={basePath} />}
    >
      <DashboardCustomersHubGrid basePath={basePath} embedded />
    </DashboardFullscreenHubShell>
  );
}
