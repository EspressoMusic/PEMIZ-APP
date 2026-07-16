"use client";

import { useMemo, useState } from "react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { appointmentCalendarOpenWeekdays } from "@/lib/order-schedule";
import type { CustomerLabels } from "./customer-labels";
import {
  APPOINTMENT_DAY_FRAME,
  APPOINTMENT_DAY_FRAME_CUSTOMER_HOME,
  APPOINTMENT_DAY_FRAME_SQUARE,
  APPOINTMENT_DAY_FRAME_SQUARE_LARGE,
  AppointmentCalendarPanel,
} from "@/components/appointment-calendar-panel";
import {
  APPOINTMENT_WEEKDAYS_EN,
  APPOINTMENT_WEEKDAYS_HE,
  appointmentStartOfMonth as startOfMonth,
  appointmentAddMonths as addMonths,
  buildAppointmentMonthWeeksForOpenDays,
  filterAppointmentWeekdayLabelsForOpenDays,
} from "@/lib/appointment-calendar-shared";

export type AppointmentSlot = {
  id: string;
  startAt: string;
  endAt: string;
  maxBookings: number;
  appointments: unknown[];
};

type DayStatus = "closed" | "past" | "noSlots" | "available" | "full";

export function appointmentLocalDateKey(iso: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatMonthTitle(month: Date, locale: CustomerLocale) {
  return month.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
    month: "long",
    year: "numeric",
  });
}

export function appointmentSlotIsOpen(slot: AppointmentSlot) {
  return (
    slot.appointments.length < slot.maxBookings &&
    new Date(slot.startAt) > new Date()
  );
}

const WEEKDAYS_HE = APPOINTMENT_WEEKDAYS_HE;
const WEEKDAYS_EN = APPOINTMENT_WEEKDAYS_EN;

export function CustomerAppointmentCalendar({
  slots,
  locale,
  labels,
  onDayOpen,
  highlightedDay = null,
  orderScheduleEnabled = false,
  orderSchedule = null,
  bookingByDay = false,
  homeLayout = false,
  squareDays = false,
  squareDaysLarge = false,
  visualVariant = "modern",
  embeddedHome = false,
}: {
  slots: AppointmentSlot[];
  locale: CustomerLocale;
  labels: CustomerLabels;
  onDayOpen: (dateKey: string, daySlots: AppointmentSlot[]) => void;
  highlightedDay?: string | null;
  orderScheduleEnabled?: boolean;
  orderSchedule?: string | null;
  bookingByDay?: boolean;
  /** Smaller calendar that shares the home screen with open-slots panel. */
  homeLayout?: boolean;
  /** Larger square day cells (customer booking modal). */
  squareDays?: boolean;
  /** Full-size modal calendar with maximum day squares. */
  squareDaysLarge?: boolean;
  visualVariant?: "bakery" | "modern";
  /** Seller-style home calendar — fills the screen height. */
  embeddedHome?: boolean;
}) {
  const isModern = visualVariant === "modern";
  const homeEmbedded = embeddedHome === true;
  const todayKey = appointmentLocalDateKey(new Date().toISOString());
  const dayFrame = isModern
    ? `appointment-day-modern${squareDaysLarge || homeEmbedded ? " appointment-day-modern--fill" : ""}`
    : homeLayout
      ? APPOINTMENT_DAY_FRAME_CUSTOMER_HOME
      : squareDaysLarge
        ? APPOINTMENT_DAY_FRAME_SQUARE_LARGE
        : squareDays
          ? APPOINTMENT_DAY_FRAME_SQUARE
          : APPOINTMENT_DAY_FRAME;
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const slotsByDay = useMemo(() => {
    const map = new Map<string, AppointmentSlot[]>();
    for (const slot of slots) {
      const key = appointmentLocalDateKey(slot.startAt);
      const list = map.get(key) ?? [];
      list.push(slot);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      );
    }
    return map;
  }, [slots]);

  const openWeekdays = useMemo(
    () => appointmentCalendarOpenWeekdays(orderScheduleEnabled, orderSchedule),
    [orderScheduleEnabled, orderSchedule]
  );
  const weekdayLabels = locale === "he" ? WEEKDAYS_HE : WEEKDAYS_EN;
  const weeks = useMemo(
    () => buildAppointmentMonthWeeksForOpenDays(month, openWeekdays),
    [month, openWeekdays]
  );
  const weekdays = filterAppointmentWeekdayLabelsForOpenDays(
    weekdayLabels,
    openWeekdays
  );
  const weekColumnCount = Math.min(
    7,
    Math.max(1, openWeekdays.length)
  ) as 1 | 2 | 3 | 4 | 5 | 6 | 7;

  function dayStatus(dateKey: string): DayStatus {
    if (dateKey < todayKey) return "past";
    const daySlots = slotsByDay.get(dateKey) ?? [];
    const futureSlots = daySlots.filter((s) => new Date(s.startAt) > new Date());
    if (futureSlots.length === 0) return "noSlots";
    if (futureSlots.some(appointmentSlotIsOpen)) return "available";
    return "full";
  }

  function pickDay(dateKey: string) {
    const daySlots = slotsByDay.get(dateKey) ?? [];
    onDayOpen(dateKey, daySlots);
  }

  const dayNormal =
    "border-bakery-success/45 bg-bakery-card text-bakery-ink";

  function dayClass(status: DayStatus, selected: boolean) {
    if (isModern) return "";
    if (selected) {
      return "border-bakery-success bg-bakery-success/15 text-bakery-ink shadow-[0_0_0_2px_rgba(67,160,71,0.28)]";
    }
    if (status === "available") {
      return `${dayNormal} cursor-pointer hover:bg-bakery-success/8 active:scale-[0.98]`;
    }
    if (status === "full") {
      return "cursor-pointer border-bakery-error bg-bakery-error text-white shadow-[0_3px_10px_rgba(168,88,88,0.35)] active:scale-[0.98]";
    }
    if (status === "closed") {
      return "cursor-pointer border-[#6D4C41]/18 bg-[#f0e6d4] text-bakery-muted active:scale-[0.98]";
    }
    if (status === "past") {
      return `cursor-pointer border-[#6D4C41]/18 bg-[#ebe3d3] text-bakery-muted active:scale-[0.98]`;
    }
    return `cursor-pointer ${dayNormal} active:scale-[0.98]`;
  }

  return (
    <AppointmentCalendarPanel
      monthTitle={formatMonthTitle(month, locale)}
      onPrevMonth={() => setMonth((m) => addMonths(m, -1))}
      onNextMonth={() => setMonth((m) => addMonths(m, 1))}
      prevMonthLabel={labels.calendarPrevMonth}
      nextMonthLabel={labels.calendarNextMonth}
      weekdays={weekdays}
      weeks={weeks}
      homeCompact={homeLayout && !homeEmbedded}
      homeLarge={homeLayout && !homeEmbedded}
      squareDays={squareDays && !squareDaysLarge && !homeEmbedded}
      squareDaysLarge={squareDaysLarge || homeEmbedded}
      fillHeight={homeEmbedded}
      visualVariant={visualVariant}
      panelClassName={homeEmbedded ? "min-h-0 flex-1" : undefined}
      weekColumnCount={weekColumnCount}
      renderDay={(cell) => {
        const dateKey = cell.dateKey!;
        const status = dayStatus(dateKey);
        const selected = highlightedDay === dateKey;
        const isToday = dateKey === todayKey;
        return (
          <button
            key={dateKey}
            type="button"
            onClick={() => pickDay(dateKey)}
            className={
              isModern
                ? `${dayFrame}${dayClass(status, selected) ? ` ${dayClass(status, selected)}` : ""}`
                : `${dayFrame} ${dayClass(status, selected)}${
                    isToday
                      ? " outline outline-[3px] outline-black outline-offset-0"
                      : ""
                  }`
            }
            data-status={isModern ? status : undefined}
            data-selected={isModern && selected ? "true" : undefined}
            data-today={isModern && isToday ? "true" : undefined}
            title={
              status === "full"
                ? labels.calendarDayFullHint
                : status === "closed"
                  ? labels.calendarDayClosedHint
                  : undefined
            }
          >
            {cell.day}
          </button>
        );
      }}
    />
  );
}
