"use client";

import { Users, Store, HelpCircle, TrendingUp } from "lucide-react";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { DashboardActionsSettingsGroup } from "@/components/dashboard/dashboard-actions-settings-group";
import { DashboardStoreStylePicker } from "@/components/dashboard/dashboard-store-style-picker";
import { DashboardActionSquare } from "@/components/dashboard/dashboard-action-square";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardActionsHub({
  businessType,
  basePath = "/dashboard",
  previewOnly = false,
}: {
  businessType: string;
  basePath?: string;
  previewOnly?: boolean;
}) {
  const { labels } = useAppLocale();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden py-3 text-center sm:py-4">
      <div className="flex min-h-0 flex-1 flex-col justify-start gap-3 overflow-y-auto overflow-x-hidden">
        <div className="bakery-float-panel shrink-0 rounded-[24px] p-3">
          <div className="grid grid-cols-2 gap-2">
            <DashboardActionSquare
              href={`${basePath}/customers`}
              icon={Users}
              label={labels.customers}
            />
            <DashboardActionSquare
              href={`${basePath}/settings`}
              icon={Store}
              label={labels.store}
            />
          </div>
        </div>

        <div className="bakery-float-panel min-h-0 rounded-[24px] p-3">
          <ul className="space-y-2 text-start">
          <DashboardActionRow
            href={`${basePath}/faq`}
            icon={HelpCircle}
            title={labels.faq}
          />
          <DashboardActionRow
            href={`${basePath}/stats/sales`}
            icon={TrendingUp}
            title={labels.salesAndProfit}
          />
          <DashboardStoreStylePicker previewOnly={previewOnly} />
          <DashboardActionsSettingsGroup basePath={basePath} />
          </ul>
        </div>
      </div>
    </div>
  );
}
