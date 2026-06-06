"use client";

import { DASHBOARD_PAGE_ROOT } from "@/components/dashboard/dashboard-panel-frame";
import { HelpCircle, Megaphone, MessageCircle, MessagesSquare } from "lucide-react";
import { DashboardActionSquare } from "@/components/dashboard/dashboard-action-square";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardCustomersHubGrid({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const { labels } = useAppLocale();

  return (
    <div className="grid grid-cols-2 gap-2">
      <DashboardActionSquare
        href={`${basePath}/customers/broadcast`}
        icon={Megaphone}
        label={labels.customerMessage}
      />
      <DashboardActionSquare
        href={`${basePath}/customers/inquiries`}
        icon={MessagesSquare}
        label={labels.customerInquiries}
      />
      <DashboardActionSquare
        href={`${basePath}/customers/chat`}
        icon={MessageCircle}
        label={labels.sellerChatTitle}
      />
      <DashboardActionSquare
        href={`${basePath}/faq`}
        icon={HelpCircle}
        label={labels.faq}
      />
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
      <div className="dashboard-card bakery-float-panel rounded-[32px] p-3">
        <DashboardCustomersHubGrid basePath={basePath} />
      </div>
    </div>
  );
}
