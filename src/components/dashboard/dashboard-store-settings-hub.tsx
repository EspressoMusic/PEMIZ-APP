"use client";

import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";
import {
  Package,
  Clock,
  ClipboardList,
  Gift,
} from "lucide-react";
import { DashboardActionSquare } from "@/components/dashboard/dashboard-action-square";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardStoreSettingsHub({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const { labels } = useAppLocale();

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} justify-start text-center`}>
      <div className={`${DASHBOARD_SCROLL_MAIN} flex flex-col justify-start gap-3`}>
      <div className="bakery-float-panel shrink-0 rounded-[24px] p-3">
        <div className="grid grid-cols-2 gap-2">
          <DashboardActionSquare
            href={`${basePath}/settings/products`}
            icon={Package}
            label={labels.products}
          />
          <DashboardActionSquare
            href={`${basePath}/settings/orders`}
            icon={ClipboardList}
            label={labels.orders}
          />
          <DashboardActionSquare
            href={`${basePath}/settings/deals`}
            icon={Gift}
            label={labels.deals}
          />
          <DashboardActionSquare
            href={`${basePath}/settings/limits`}
            icon={Clock}
            label={labels.limits}
          />
        </div>
      </div>
      </div>
    </div>
  );
}
