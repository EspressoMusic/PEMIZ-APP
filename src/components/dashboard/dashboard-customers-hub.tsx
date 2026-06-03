"use client";

import { DASHBOARD_PAGE_ROOT } from "@/components/dashboard/dashboard-panel-frame";
import { Megaphone, MessagesSquare } from "lucide-react";
import { DashboardActionSquare } from "@/components/dashboard/dashboard-action-square";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardCustomersHub({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const { labels } = useAppLocale();

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} justify-start pb-2 text-center`}>
      <div className="bakery-float-panel rounded-[24px] p-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
        </div>
      </div>
    </div>
  );
}
