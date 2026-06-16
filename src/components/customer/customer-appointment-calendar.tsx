"use client";

import { useMemo, useState } from "react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import { isSellerWorkingDay } from "@/lib/order-schedule";
import type { CustomerLabels } from "./customer-labels";
import {
  APPOINTMENT_DAY_FRAME,
  APPOINTMENT_DAY_FRAME_CUSTOMER_HOME,
  APPOINTMENT_DAY_FRAME_SQUARE,
  APPOINTMENT_DAY_FRAME_SQUARE_LARGE,
  AppointmentCalendarPanel,
} from "@/components/appointment-calendar-panel";

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

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function buildMonthCells(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const leading = first.getDay();
  const daysInMonth = last.getDate();
  const cells: Array<{ day: number | null; dateKey: string | null }> = [];

  for (let i = 0; i < leading; i++) cells.push({ day: null, dateKey: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, dateKey });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, dateKey: null });
  return cells;
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

const WEEKDAYS_HE = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
}) {
  const todayKey = appointmentLocalDateKey(new Date().toISOString());
  const dayFrame = homeLayout
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

  const monthCells = useMemo(() => buildMonthCells(month), [month]);
  const weeks = useMemo(() => {
    const rows: (typeof monthCells)[] = [];
    for (let i = 0; i < monthCells.length; i += 7) {
      rows.push(monthCells.slice(i, i + 7));
    }
    return rows;
  }, [monthCells]);
  const weekdays = locale === "he" ? WEEKDAYS_HE : WEEKDAYS_EN;

  function dayStatus(dateKey: string): DayStatus {
    if (
      !isSellerWorkingDay(dateKey, orderScheduleEnabled, orderSchedule)
    ) {
      return "closed";
    }
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
    "border-[#5C4A3E]/22 bg-bakery-card text-bakery-ink";

  function dayClass(status: DayStatus, selected: boolean) {
    if (selected) {
      return "border-bakery-primary bg-bakery-primary text-bakery-on-primary shadow-[0_3px_10px_rgba(58,47,38,0.18)]";
    }
    if (status === "available") {
      return `${dayNormal} cursor-pointer hover:bg-bakery-cream-light active:scale-[0.98]`;
    }
    if (status === "full") {
      return "cursor-pointer border-bakery-error bg-bakery-error text-white shadow-[0_3px_10px_rgba(168,88,88,0.35)] active:scale-[0.98]";
    }
    if (status === "closed") {
      return "cursor-pointer border-[#5C4A3E]/22 bg-bakery-card/35 text-bakery-muted/40 active:scale-[0.98]";
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
      homeCompact={homeLayout}
      homeLarge={homeLayout}
      squareDays={squareDays && !squareDaysLarge}
      squareDaysLarge={squareDaysLarge}
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
            className={`${dayFrame} ${dayClass(status, selected)}${
              isToday
                ? " outline outline-[3px] outline-black outline-offset-0"
                : ""
            }`}
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
