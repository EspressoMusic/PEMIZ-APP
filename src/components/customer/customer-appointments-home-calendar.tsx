"use client";

import { useState, type CSSProperties } from "react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import type { CustomerLabels } from "./customer-labels";
import {
  CustomerAppointmentCalendar,
  type AppointmentSlot,
} from "./customer-appointment-calendar";
import { CustomerAppointmentDayModal } from "./customer-appointment-day-modal";
import {
  CustomerAppointmentReminderRow,
  hasFullyBookedFutureDays,
} from "./customer-appointment-reminder-row";
import { APPOINTMENTS_HOME_BG } from "./customer-appointments-home-backdrop";

export function CustomerAppointmentsHomeCalendar({
  slots,
  locale,
  labels,
  orderScheduleEnabled = false,
  orderSchedule = null,
  bookingByDay = false,
  businessSlug,
  customerPhone = "",
  onNeedPhone,
  onBook,
  rentalMode = false,
  storeTheme = "turquoise",
}: {
  slots: AppointmentSlot[];
  locale: CustomerLocale;
  labels: CustomerLabels;
  orderScheduleEnabled?: boolean;
  orderSchedule?: string | null;
  bookingByDay?: boolean;
  businessSlug: string;
  customerPhone?: string;
  onNeedPhone: () => void;
  onBook: (dateKey: string, daySlots: AppointmentSlot[]) => void;
  rentalMode?: boolean;
  storeTheme?: StoreThemeId;
}) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedDaySlots, setSelectedDaySlots] = useState<AppointmentSlot[]>([]);

  return (
    <>
      <div
        className="customer-appointments-home flex h-full min-h-0 flex-1 flex-col overflow-hidden px-3 pb-3 pt-3"
        style={
          {
            "--customer-appointments-home-bg": APPOINTMENTS_HOME_BG,
          } as CSSProperties
        }
      >
        <div
          className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden"
          role="region"
          aria-label={
            rentalMode ? labels.calendarPickCheckIn : labels.calendarPickDay
          }
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CustomerAppointmentCalendar
              slots={slots}
              locale={locale}
              labels={labels}
              embeddedHome
              visualVariant="modern"
              orderScheduleEnabled={orderScheduleEnabled}
              orderSchedule={orderSchedule}
              bookingByDay={bookingByDay}
              highlightedDay={selectedDay}
              onDayOpen={(dateKey, daySlots) => {
                setSelectedDay(dateKey);
                setSelectedDaySlots(daySlots);
              }}
            />
          </div>
        </div>
        {hasFullyBookedFutureDays(slots) ? (
          <div className="mt-2 shrink-0 px-1 pb-1">
            <CustomerAppointmentReminderRow
              businessSlug={businessSlug}
              slots={slots}
              labels={labels}
              customerPhone={customerPhone}
              onNeedPhone={onNeedPhone}
            />
          </div>
        ) : null}
      </div>

      <CustomerAppointmentDayModal
        open={!!selectedDay}
        onClose={() => {
          setSelectedDay(null);
          setSelectedDaySlots([]);
        }}
        dateKey={selectedDay}
        slots={selectedDaySlots}
        locale={locale}
        labels={labels}
        orderScheduleEnabled={orderScheduleEnabled}
        orderSchedule={orderSchedule}
        bookingByDay={bookingByDay}
        rentalMode={rentalMode}
        storeTheme={storeTheme}
        onBook={(dateKey, daySlots) => {
          onBook(dateKey, daySlots);
          setSelectedDay(null);
          setSelectedDaySlots([]);
        }}
      />
    </>
  );
}
