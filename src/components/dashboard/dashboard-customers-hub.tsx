"use client";

import { DashboardFullscreenHubShell } from "@/components/dashboard/dashboard-panel-frame";
import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
import { HelpCircle, Inbox, Star } from "lucide-react";
import { DashboardBroadcastEntry } from "@/components/dashboard/dashboard-store-broadcast";
import {
  DashboardActionRow,
} from "@/components/dashboard/dashboard-action-row";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

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

  const list = (
    <ul className="dashboard-settings-style-rows space-y-2 text-start">
      <DashboardBroadcastEntry previewOnly={isDevPreview} />
      <DashboardActionRow
        href={`${basePath}/customers/inquiries`}
        icon={Inbox}
        title={labels.customerInquiries}
      />
      <DashboardActionRow
        href={`${basePath}/customers/reviews`}
        icon={Star}
        title={labels.reviewsTitle}
      />
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
