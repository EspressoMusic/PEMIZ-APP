"use client";

import { Users, Package, Store, HelpCircle, TrendingUp } from "lucide-react";
import { parseStoreTheme } from "@/lib/store-themes";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { DashboardStoreStylePicker } from "@/components/dashboard/dashboard-store-style-picker";
import { DashboardActionSquare } from "@/components/dashboard/dashboard-action-square";

export function DashboardActionsHub({
  businessType,
  basePath = "/dashboard",
  storeTheme = "calm",
  storeLocale = "he",
  previewOnly = false,
}: {
  businessType: string;
  basePath?: string;
  storeTheme?: string;
  storeLocale?: string;
  previewOnly?: boolean;
}) {
  const isStore = businessType === "STORE";
  const productsHref = isStore
    ? `${basePath}/products`
    : `${basePath}/slots`;
  const productsLabel = isStore ? "מוצרים" : "תורים";
  const theme = parseStoreTheme(storeTheme);

  return (
    <div className="space-y-5 pb-2 text-center">
      <div>
        <h1 className="text-[22px] font-extrabold text-bakery-ink">פעולות</h1>
      </div>

      <div className="bakery-float-panel rounded-[24px] p-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <DashboardActionSquare
            href={`${basePath}/customers`}
            icon={Users}
            label="לקוחות"
          />
          <DashboardActionSquare
            href={productsHref}
            icon={Package}
            label={productsLabel}
          />
          <DashboardActionSquare
            href={`${basePath}/settings`}
            icon={Store}
            label="הגדרות החנות"
          />
        </div>
      </div>

      <div className="bakery-float-panel rounded-[24px] p-4">
        <ul className="space-y-3 text-start">
          <DashboardActionRow
            href={`${basePath}/faq`}
            icon={HelpCircle}
            title="שאלות ותשובות"
          />
          <DashboardActionRow
            href={`${basePath}/stats/sales`}
            icon={TrendingUp}
            title="מכירות ורווחים"
          />
          <DashboardStoreStylePicker
            initialTheme={theme}
            initialLocale={storeLocale === "en" ? "en" : "he"}
            previewOnly={previewOnly}
          />
        </ul>
      </div>
    </div>
  );
}
