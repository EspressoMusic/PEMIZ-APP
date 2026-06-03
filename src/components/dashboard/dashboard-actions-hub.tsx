"use client";

import Link from "next/link";
import {
  Users,
  Package,
  Store,
  HelpCircle,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { CustomerDisplayTheme } from "@/lib/customer-preferences";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { DashboardStoreStylePicker } from "@/components/dashboard/dashboard-store-style-picker";

function ActionSquare({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="bakery-float-tile flex aspect-square flex-col items-center justify-center gap-3 rounded-[20px] px-2 py-4 text-center sm:gap-3.5 sm:px-3 sm:py-5"
    >
      <Icon
        className="h-10 w-10 text-bakery-ink sm:h-12 sm:w-12"
        strokeWidth={1.75}
      />
      <span className="px-0.5 text-[14px] font-extrabold leading-snug text-bakery-ink sm:text-[16px]">
        {label}
      </span>
    </Link>
  );
}

function parseStoreTheme(value: string | undefined): CustomerDisplayTheme {
  if (value === "light" || value === "dark") return value;
  return "calm";
}

export function DashboardActionsHub({
  businessType,
  basePath = "/dashboard",
  storeTheme = "calm",
  previewOnly = false,
}: {
  businessType: string;
  basePath?: string;
  storeTheme?: string;
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
          <ActionSquare
            href={`${basePath}/customers`}
            icon={Users}
            label="לקוחות"
          />
          <ActionSquare href={productsHref} icon={Package} label={productsLabel} />
          <ActionSquare
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
            title="סטטיסטיקת מכירות"
          />
        </ul>
      </div>

      <div className="bakery-float-panel rounded-[24px] p-4">
        <DashboardStoreStylePicker
          initialTheme={theme}
          previewOnly={previewOnly}
        />
      </div>
    </div>
  );
}
