"use client";

import { useState } from "react";
import { DashboardFullscreenHubShell } from "@/components/dashboard/dashboard-panel-frame";
import { ClipboardList, CalendarClock, ChevronLeft } from "lucide-react";
import { DashboardProductsEntry } from "@/components/dashboard/products-manager";
import {
  DEV_APPOINTMENTS_BUSINESS,
  DEV_RENTAL_BUSINESS,
} from "@/lib/dev-preview-data";
import { AppointmentsManager } from "@/components/dashboard-client";
import {
  DashboardActionRowButton,
} from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardAppointmentsCalendarSettings } from "@/components/dashboard/dashboard-appointments-calendar-settings";
import type { DashboardAppointmentView } from "@/components/dashboard/dashboard-appointment-card";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardActionsBackLink } from "@/components/dashboard/dashboard-back-links";
import { calendarConfigFromBusiness } from "@/lib/appointment-calendar-config";
import {
  DEFAULT_APPOINTMENT_CALENDAR,
  type AppointmentCalendarConfig,
} from "@/lib/appointment-slot-generator";

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

function DashboardAppointmentActiveGroup({
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
        icon={ClipboardList}
        title={labels.appointments}
      />
      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={labels.activeAppointments}
        ariaLabel={labels.activeAppointments}
        placement="top"
        showBackButton
      >
        <AppointmentsManager
          sheetActiveOnly
          previewOnly={previewOnly}
          initialAppointments={previewAppointments}
          initialBookingByDay={previewBookingByDay}
        />
      </DashboardActionSheet>
    </>
  );
}

function DashboardAppointmentCalendarGroup({
  previewOnly = false,
  initialConfig = DEFAULT_APPOINTMENT_CALENDAR,
  workingDays,
  basePath = "/dashboard",
}: {
  previewOnly?: boolean;
  initialConfig?: AppointmentCalendarConfig;
  workingDays?: {
    initialEnabled: boolean;
    initialScheduleJson: string | null;
    previewOnly?: boolean;
  };
  basePath?: string;
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();

  return (
    <>
      <DashboardActionRowButton
        onClick={() => setOpen(true)}
        icon={CalendarClock}
        title={labels.appointmentCalendar}
        expanded={open}
        active={open}
      />
      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={labels.appointmentBookingHours}
        ariaLabel={labels.appointmentBookingHours}
        placement="center"
        showBackButton
        compact
        panelClassName="dashboard-appointments-calendar-sheet"
      >
        <DashboardAppointmentsCalendarSettings
          inline
          previewOnly={previewOnly}
          initialConfig={initialConfig}
          workingDays={workingDays}
          basePath={basePath}
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
  initialCalendarConfig,
  initialWorkingDays,
}: {
  basePath?: string;
  previewOnly?: boolean;
  previewAppointments?: DashboardAppointmentView[];
  previewBookingByDay?: boolean;
  initialCalendarConfig?: AppointmentCalendarConfig;
  initialWorkingDays?: {
    initialEnabled: boolean;
    initialScheduleJson: string | null;
  };
}) {
  const isDevPreview = basePath.startsWith("/dev/");
  const devBusiness = basePath.startsWith("/dev/seller-rental")
    ? DEV_RENTAL_BUSINESS
    : DEV_APPOINTMENTS_BUSINESS;
  const devServices = devBusiness.products;
  const calendarConfig =
    initialCalendarConfig ??
    (isDevPreview ? calendarConfigFromBusiness(devBusiness) : DEFAULT_APPOINTMENT_CALENDAR);
  const workingDays = initialWorkingDays
    ? { ...initialWorkingDays, previewOnly: previewOnly || isDevPreview }
    : isDevPreview
      ? {
          initialEnabled: devBusiness.orderScheduleEnabled ?? false,
          initialScheduleJson: devBusiness.orderSchedule ?? null,
          previewOnly: true,
        }
      : {
          initialEnabled: false,
          initialScheduleJson: null,
          previewOnly,
        };

  return (
    <ul className="dashboard-settings-style-rows space-y-2 text-start">
      <DashboardAppointmentActiveGroup
        previewOnly={previewOnly}
        previewAppointments={previewAppointments}
        previewBookingByDay={previewBookingByDay}
      />
      <DashboardProductsEntry
        mode="services"
        previewOnly={isDevPreview}
        initialProducts={isDevPreview ? devServices : undefined}
      />
      <DashboardAppointmentCalendarGroup
        previewOnly={previewOnly || isDevPreview}
        initialConfig={calendarConfig}
        workingDays={workingDays}
        basePath={basePath}
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
  initialCalendarConfig,
  initialWorkingDays,
}: {
  basePath: string;
  embedded?: boolean;
  previewOnly?: boolean;
  previewAppointments?: DashboardAppointmentView[];
  previewBookingByDay?: boolean;
  initialCalendarConfig?: AppointmentCalendarConfig;
  initialWorkingDays?: {
    initialEnabled: boolean;
    initialScheduleJson: string | null;
  };
}) {
  const grid = (
    <DashboardAppointmentsSettingsHubGrid
      basePath={basePath}
      previewOnly={previewOnly}
      previewAppointments={previewAppointments}
      previewBookingByDay={previewBookingByDay}
      initialCalendarConfig={initialCalendarConfig}
      initialWorkingDays={initialWorkingDays}
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
  initialCalendarConfig,
  initialWorkingDays,
}: {
  basePath?: string;
  embedded?: boolean;
  previewOnly?: boolean;
  previewAppointments?: DashboardAppointmentView[];
  previewBookingByDay?: boolean;
  initialCalendarConfig?: AppointmentCalendarConfig;
  initialWorkingDays?: {
    initialEnabled: boolean;
    initialScheduleJson: string | null;
  };
}) {
  if (embedded) {
    return (
      <DashboardAppointmentsSettingsHubBody
        basePath={basePath}
        embedded
        previewOnly={previewOnly}
        previewAppointments={previewAppointments}
        previewBookingByDay={previewBookingByDay}
        initialCalendarConfig={initialCalendarConfig}
        initialWorkingDays={initialWorkingDays}
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
        initialCalendarConfig={initialCalendarConfig}
        initialWorkingDays={initialWorkingDays}
      />
    </>
  );
}

export function DashboardAppointmentsSettingsHub({
  basePath = "/dashboard",
  previewOnly = false,
  previewAppointments = [] as DashboardAppointmentView[],
  previewBookingByDay = false,
  initialCalendarConfig,
  initialWorkingDays,
}: {
  basePath?: string;
  previewOnly?: boolean;
  previewAppointments?: DashboardAppointmentView[];
  previewBookingByDay?: boolean;
  initialCalendarConfig?: AppointmentCalendarConfig;
  initialWorkingDays?: {
    initialEnabled: boolean;
    initialScheduleJson: string | null;
  };
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
        initialCalendarConfig={initialCalendarConfig}
        initialWorkingDays={initialWorkingDays}
      />
    </DashboardFullscreenHubShell>
  );
}
