"use client";

import { useState } from "react";
import { MessageCircle, Settings, User } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";

export function DashboardActionsSettingsGroup({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();

  return (
    <>
      <li>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bakery-float-tile flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start"
        >
          <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <Settings className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
            {labels.settings}
          </span>
        </button>
      </li>

      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={labels.settings}
      >
        <ul className="space-y-2 text-start">
          <DashboardActionRow
            href={`${basePath}/settings/whatsapp`}
            icon={MessageCircle}
            title={labels.whatsappAlerts}
          />
          <DashboardActionRow
            href={`${basePath}/settings/account`}
            icon={User}
            title={labels.accountAndLink}
          />
        </ul>
      </DashboardActionSheet>
    </>
  );
}
