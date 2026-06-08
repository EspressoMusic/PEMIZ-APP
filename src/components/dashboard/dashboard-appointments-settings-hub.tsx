"use client";

import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";
import { Package, ClipboardList, ChevronLeft, History } from "lucide-react";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";

function DashboardAppointmentsSettingsHubBack({
  basePath = "/dashboard",
  onBack,
}: {
  basePath?: string;
  onBack?: () => void;
}) {
  const { labels } = useAppLocale();

  if (onBack) {
    return (
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] shrink-0 items-center gap-1 text-[14px] font-bold text-bakery-primary transition active:opacity-80"
      >
        <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
        {labels.backToActions}
      </button>
    );
  }

  return <DashboardActionsBackLink basePath={basePath} />;
}

export function DashboardAppointmentsSettingsHubGrid({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const { labels } = useAppLocale();

  return (
    <ul className="space-y-2 text-start">
      <DashboardActionRow
        href={`${basePath}/settings/products`}
        icon={Package}
        title={labels.services}
      />
      <DashboardActionRow
        href={`${basePath}/settings/appointments`}
        icon={ClipboardList}
        title={labels.appointments}
      />
      <DashboardActionRow
        href={`${basePath}/settings/appointments/history`}
        icon={History}
        title={labels.appointmentHistory}
      />
    </ul>
  );
}

function DashboardAppointmentsSettingsHubBody({
  basePath,
  embedded = false,
}: {
  basePath: string;
  embedded?: boolean;
}) {
  const grid = <DashboardAppointmentsSettingsHubGrid basePath={basePath} />;
  if (embedded) return grid;
  return (
    <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
      {grid}
    </div>
  );
}

export function DashboardAppointmentsSettingsHubPanel({
  basePath = "/dashboard",
  embedded = false,
}: {
  basePath?: string;
  embedded?: boolean;
}) {
  if (embedded) {
    return <DashboardAppointmentsSettingsHubBody basePath={basePath} embedded />;
  }

  return (
    <>
      <div className="px-1 text-start">
        <DashboardAppointmentsSettingsHubBack basePath={basePath} />
      </div>
      <DashboardAppointmentsSettingsHubBody basePath={basePath} />
    </>
  );
}

export function DashboardAppointmentsSettingsHub({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  return (
    <div className={`${DASHBOARD_PAGE_ROOT} justify-start text-center`}>
      <div
        className={`${DASHBOARD_SCROLL_MAIN} flex flex-col justify-start gap-3`}
      >
        <DashboardAppointmentsSettingsHubPanel basePath={basePath} />
      </div>
    </div>
  );
}
