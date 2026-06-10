"use client";

import { useState } from "react";
import { DashboardFullscreenHubShell } from "@/components/dashboard/dashboard-panel-frame";
import { ClipboardList, ChevronLeft, History } from "lucide-react";
import { DashboardProductsEntry } from "@/components/dashboard/products-manager";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_RENTAL_BUSINESS,
} from "@/lib/dev-preview-data";
import { AppointmentsManager } from "@/components/dashboard-client";
import {
  DashboardActionRow,
  DashboardActionRowButton,
} from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import type { DashboardAppointmentView } from "@/components/dashboard/dashboard-appointment-card";
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

function DashboardAppointmentHistoryGroup({
  previewOnly = false,
  previewAppointments = [] as DashboardAppointmentView[],
  previewBookingByDay = false,
}: {
  previewOnly?: boolean;
  previewAppointments?: DashboardAppointmentView[];
  previewBookingByDay?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();

  return (
    <>
      <DashboardActionRowButton
        onClick={() => setOpen(true)}
        icon={History}
        title={labels.appointmentHistory}
      />
      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={labels.appointmentHistory}
        ariaLabel={labels.appointmentHistory}
        placement="top"
        showBackButton
      >
        <AppointmentsManager
          sheetHistoryOnly
          previewOnly={previewOnly}
          initialAppointments={previewAppointments}
          initialBookingByDay={previewBookingByDay}
        />
      </DashboardActionSheet>
    </>
  );
}

export function DashboardAppointmentsSettingsHubGrid({
  basePath = "/dashboard",
  previewOnly = false,
  previewAppointments = [] as DashboardAppointmentView[],
  previewBookingByDay = false,
}: {
  basePath?: string;
  previewOnly?: boolean;
  previewAppointments?: DashboardAppointmentView[];
  previewBookingByDay?: boolean;
}) {
  const { labels } = useAppLocale();
  const isDevPreview = basePath.startsWith("/dev/");
  const devServices = basePath.startsWith("/dev/seller-rental")
    ? DEV_RENTAL_BUSINESS.products
    : DEV_APPOINTMENTS_BUSINESS.products;

  return (
    <ul className="dashboard-settings-style-rows space-y-2 text-start">
      <DashboardProductsEntry
        mode="services"
        previewOnly={isDevPreview}
        initialProducts={isDevPreview ? devServices : undefined}
      />
      <DashboardActionRow
        href={`${basePath}/settings/appointments`}
        icon={ClipboardList}
        title={labels.appointments}
      />
      <DashboardAppointmentHistoryGroup
        previewOnly={previewOnly}
        previewAppointments={previewAppointments}
        previewBookingByDay={previewBookingByDay}
      />
    </ul>
  );
}

function DashboardAppointmentsSettingsHubBody({
  basePath,
  embedded = false,
  previewOnly = false,
  previewAppointments = [] as DashboardAppointmentView[],
  previewBookingByDay = false,
}: {
  basePath: string;
  embedded?: boolean;
  previewOnly?: boolean;
  previewAppointments?: DashboardAppointmentView[];
  previewBookingByDay?: boolean;
}) {
  const grid = (
    <DashboardAppointmentsSettingsHubGrid
      basePath={basePath}
      previewOnly={previewOnly}
      previewAppointments={previewAppointments}
      previewBookingByDay={previewBookingByDay}
    />
  );
  if (embedded) return grid;
  return (
    <div className="dashboard-card dashboard-hub-panel bakery-float-panel shrink-0 rounded-[32px] p-3">
      {grid}
    </div>
  );
}

export function DashboardAppointmentsSettingsHubPanel({
  basePath = "/dashboard",
  embedded = false,
  previewOnly = false,
  previewAppointments = [] as DashboardAppointmentView[],
  previewBookingByDay = false,
}: {
  basePath?: string;
  embedded?: boolean;
  previewOnly?: boolean;
  previewAppointments?: DashboardAppointmentView[];
  previewBookingByDay?: boolean;
}) {
  if (embedded) {
    return (
      <DashboardAppointmentsSettingsHubBody
        basePath={basePath}
        embedded
        previewOnly={previewOnly}
        previewAppointments={previewAppointments}
        previewBookingByDay={previewBookingByDay}
      />
    );
  }

  return (
    <>
      <div className="px-1 text-start">
        <DashboardAppointmentsSettingsHubBack basePath={basePath} />
      </div>
      <DashboardAppointmentsSettingsHubBody
        basePath={basePath}
        previewOnly={previewOnly}
        previewAppointments={previewAppointments}
        previewBookingByDay={previewBookingByDay}
      />
    </>
  );
}

export function DashboardAppointmentsSettingsHub({
  basePath = "/dashboard",
  previewOnly = false,
  previewAppointments = [] as DashboardAppointmentView[],
  previewBookingByDay = false,
}: {
  basePath?: string;
  previewOnly?: boolean;
  previewAppointments?: DashboardAppointmentView[];
  previewBookingByDay?: boolean;
}) {
  return (
    <DashboardFullscreenHubShell
      backLink={<DashboardActionsBackLink basePath={basePath} />}
    >
      <DashboardAppointmentsSettingsHubGrid
        basePath={basePath}
        previewOnly={previewOnly}
        previewAppointments={previewAppointments}
        previewBookingByDay={previewBookingByDay}
      />
    </DashboardFullscreenHubShell>
  );
}
