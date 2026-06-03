"use client";

import { Package, Clock, ClipboardList, User } from "lucide-react";
import { DashboardActionSquare } from "@/components/dashboard/dashboard-action-square";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";

export function DashboardStoreSettingsHub({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  return (
    <div className="space-y-5 pb-2 text-center">
      <div>
        <h1 className="text-[22px] font-extrabold text-bakery-ink">הגדרות החנות</h1>
      </div>

      <div className="bakery-float-panel rounded-[24px] p-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <DashboardActionSquare
            href={`${basePath}/settings/products`}
            icon={Package}
            label="מוצרים"
          />
          <DashboardActionSquare
            href={`${basePath}/settings/limits`}
            icon={Clock}
            label="הגבלות"
          />
          <DashboardActionSquare
            href={`${basePath}/settings/orders`}
            icon={ClipboardList}
            label="הזמנות קיימות"
          />
        </div>
      </div>

      <div className="bakery-float-panel rounded-[24px] p-4">
        <ul className="space-y-3 text-start">
          <DashboardActionRow
            href={`${basePath}/settings/account`}
            icon={User}
            title="חשבון וקישור לחנות"
          />
        </ul>
      </div>
    </div>
  );
}
