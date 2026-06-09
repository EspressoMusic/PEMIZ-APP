"use client";

import { CalendarClock } from "lucide-react";
import { DashboardActionRow } from "@/components/dashboard/dashboard-action-row";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

export function DashboardCalendarLimitsSettingsGroup({
  basePath = "/dashboard",
}: {
  basePath?: string;
}) {
  const { labels } = useAppLocale();

  return (
    <DashboardActionRow
      href={`${basePath}/settings/slots`}
      icon={CalendarClock}
      title={labels.appointmentCalendarAndLimits}
    />
  );
}
