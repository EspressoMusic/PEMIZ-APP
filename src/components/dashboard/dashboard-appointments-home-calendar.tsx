"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  APPOINTMENT_DAY_FRAME_HOME,
  AppointmentCalendarPanel,
} from "@/components/appointment-calendar-panel";
import { splitSellerAppointments } from "@/lib/seller-appointment-history";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardAppointmentCard } from "@/components/dashboard/dashboard-appointment-card";
import {
  APPOINTMENT_WEEKDAYS_EN,
  APPOINTMENT_WEEKDAYS_HE,
  appointmentAddMonths,
  appointmentLocalDateKey,
  appointmentStartOfMonth,
  buildAppointmentMonthCells,
  calendarSlotIsOpen,
  formatAppointmentDayTitle,
  formatAppointmentMonthTitle,
  formatAppointmentSlotTime,
  type CalendarSlot,
} from "@/lib/appointment-calendar-shared";

export type SellerHomeAppointment = {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  notes?: string | null;
  slot: { startAt: string; endAt: string };
};

type SellerDayStatus = "full" | "open" | "booked" | "empty" | "past";

function DashboardDayAppointmentsModal({
  open,
  onClose,
  dateKey,
  slots,
  appointments,
  bookingByDay = false,
}: {
  open: boolean;
  onClose: () => void;
  dateKey: string | null;
  slots: CalendarSlot[];
  appointments: SellerHomeAppointment[];
  bookingByDay?: boolean;
}) {
  const { labels, locale } = useAppLocale();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !dateKey || typeof document === "undefined") return null;

  const title = formatAppointmentDayTitle(dateKey, locale);
  const sortedSlots = [...slots].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );
  const dayAppointments = [...appointments].sort(
    (a, b) =>
      new Date(a.slot.startAt).getTime() - new Date(b.slot.startAt).getTime()
  );

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={labels.homeCalendarDayTitle}
      >
        <button
          type="button"
          className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
          onClick={onClose}
          aria-label={labels.close}
        />
        <div className="relative flex max-h-[min(88dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-[24px] border-[3px] border-[#5C4A3E]/22 bg-bakery-square shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
          <div className="relative flex shrink-0 min-h-[52px] items-center justify-center border-b border-bakery-border/25 px-12 py-3">
            <h2 className="w-full text-center text-[17px] font-extrabold leading-tight text-bakery-ink">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="absolute end-2 top-1/2 -translate-y-1/2 shrink-0 rounded-full p-1.5 text-bakery-muted transition hover:bg-bakery-card/80"
              aria-label={labels.close}
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3">
            <section className="space-y-2">
              <h3 className="text-center text-[13px] font-bold text-bakery-muted">
                {labels.homeCalendarDaySlots}
              </h3>
              {sortedSlots.length === 0 ? (
                <p className="rounded-[16px] border border-bakery-border/30 bg-bakery-card/70 px-4 py-4 text-center text-[14px] font-semibold text-bakery-muted">
                  {labels.homeCalendarNoSlotsDay}
                </p>
              ) : (
                <ul className="space-y-2">
                  {sortedSlots.map((slot) => {
                    const isOpen = calendarSlotIsOpen(slot);
                    const booked = slot.appointments.length;
                    return (
                      <li
                        key={slot.id}
                        className="flex items-center justify-between gap-2 rounded-[16px] border border-bakery-border/35 bg-bakery-card px-3 py-2.5"
                      >
                        <span
                          className="text-[14px] font-extrabold tabular-nums text-bakery-ink"
                          dir="ltr"
                        >
                          {formatAppointmentSlotTime(slot.startAt, locale)}
                          <span className="mx-1 font-semibold text-bakery-muted">
                            –
                          </span>
                          {formatAppointmentSlotTime(slot.endAt, locale)}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                            isOpen
                              ? "bg-bakery-card text-bakery-ink"
                              : "bg-[#b85c5c] text-[#faf4e6]"
                          }`}
                        >
                          {isOpen
                            ? `${labels.homeCalendarSlotOpen} · ${booked}/${slot.maxBookings}`
                            : `${labels.homeCalendarSlotFull} · ${booked}/${slot.maxBookings}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="space-y-2">
              <h3 className="text-center text-[13px] font-bold text-bakery-muted">
                {labels.activeAppointments}
              </h3>
              {dayAppointments.length === 0 ? (
                <p className="rounded-[16px] border border-bakery-border/30 bg-bakery-card/70 px-4 py-4 text-center text-[14px] font-semibold text-bakery-muted">
                  {labels.homeCalendarNoAppointmentsDay}
                </p>
              ) : (
                <ul className="space-y-2">
                  {dayAppointments.map((appt) => (
                    <li key={appt.id}>
                      <DashboardAppointmentCard
                        appointment={appt}
                        bookingByDay={bookingByDay}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export function DashboardAppointmentsHomeCalendar({
  previewOnly = false,
  initialSlots = [],
  initialAppointments = [],
  initialBookingByDay = false,
}: {
  previewOnly?: boolean;
  initialSlots?: CalendarSlot[];
  initialAppointments?: SellerHomeAppointment[];
  initialBookingByDay?: boolean;
}) {
  const { labels, locale } = useAppLocale();
  const todayKey = appointmentLocalDateKey(new Date().toISOString());
  const [month, setMonth] = useState(() => appointmentStartOfMonth(new Date()));
  const [slots, setSlots] = useState(initialSlots);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [bookingByDay, setBookingByDay] = useState(initialBookingByDay);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (previewOnly) {
      setSlots(initialSlots);
      setAppointments(initialAppointments);
      setBookingByDay(initialBookingByDay);
      return;
    }

    let cancelled = false;
    async function load() {
      const [slotsRes, apptsRes, calendarRes] = await Promise.all([
        fetch("/api/dashboard/slots"),
        fetch("/api/dashboard/appointments"),
        fetch("/api/dashboard/appointment-calendar"),
      ]);
      const slotsData = await slotsRes.json().catch(() => ({}));
      const apptsData = await apptsRes.json().catch(() => ({}));
      const calendarData = await calendarRes.json().catch(() => ({}));
      if (cancelled) return;
      if (slotsRes.ok) setSlots((slotsData as { slots?: CalendarSlot[] }).slots ?? []);
      if (apptsRes.ok) {
        setAppointments(
          (apptsData as { appointments?: SellerHomeAppointment[] }).appointments ??
            []
        );
      }
      if (calendarRes.ok) {
        setBookingByDay(
          Boolean(
            (calendarData as { config?: { bookingByDay?: boolean } }).config
              ?.bookingByDay
          )
        );
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [previewOnly, initialSlots, initialAppointments, initialBookingByDay]);

  const slotsByDay = useMemo(() => {
    const map = new Map<string, CalendarSlot[]>();
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

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, SellerHomeAppointment[]>();
    for (const appt of appointments) {
      const key = appointmentLocalDateKey(appt.slot.startAt);
      const list = map.get(key) ?? [];
      list.push(appt);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(a.slot.startAt).getTime() - new Date(b.slot.startAt).getTime()
      );
    }
    return map;
  }, [appointments]);

  const monthCells = useMemo(() => buildAppointmentMonthCells(month), [month]);
  const weeks = useMemo(() => {
    const rows: (typeof monthCells)[] = [];
    for (let i = 0; i < monthCells.length; i += 7) {
      rows.push(monthCells.slice(i, i + 7));
    }
    return rows;
  }, [monthCells]);
  const weekdays = locale === "he" ? APPOINTMENT_WEEKDAYS_HE : APPOINTMENT_WEEKDAYS_EN;

  function dayStatus(dateKey: string): SellerDayStatus {
    const daySlots = slotsByDay.get(dateKey) ?? [];
    const dayAppointments =
      appointmentsByDay.get(dateKey)?.filter((a) => a.status !== "CANCELLED") ??
      [];
    const futureSlots = daySlots.filter((s) => new Date(s.startAt) > new Date());

    if (dateKey < todayKey) {
      return dayAppointments.length > 0 || daySlots.length > 0 ? "booked" : "past";
    }
    if (futureSlots.length === 0) {
      return dayAppointments.length > 0 ? "booked" : "empty";
    }
    if (!futureSlots.some(calendarSlotIsOpen)) return "full";
    if (dayAppointments.length > 0) return "booked";
    return "open";
  }

  function pickDay(dateKey: string) {
    setSelectedDay(dateKey);
    setDayModalOpen(true);
  }

  const dayNormal =
    "border-[#5C4A3E]/22 bg-bakery-card text-bakery-ink";

  function dayClass(status: SellerDayStatus, selected: boolean) {
    if (selected) {
      return "border-bakery-primary bg-bakery-primary text-bakery-on-primary shadow-[0_3px_10px_rgba(58,47,38,0.18)]";
    }
    if (status === "full") {
      return "cursor-pointer border-[#5C4A3E]/22 bg-[#b85c5c] text-[#faf4e6] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] active:scale-[0.98]";
    }
    if (status === "open" || status === "booked") {
      return `${dayNormal} cursor-pointer hover:bg-bakery-cream-light active:scale-[0.98]`;
    }
    if (status === "past") {
      return `cursor-pointer ${dayNormal} opacity-45 active:scale-[0.98]`;
    }
    return `cursor-pointer ${dayNormal} opacity-55 active:scale-[0.98]`;
  }

  const selectedDayAppointments = selectedDay
    ? (appointmentsByDay.get(selectedDay) ?? [])
    : [];
  const selectedDaySlots = selectedDay
    ? (slotsByDay.get(selectedDay) ?? [])
    : [];

  const upcomingAppointments = useMemo(() => {
    const { active } = splitSellerAppointments(appointments, nowMs);
    return active
      .filter(
        (appt) =>
          appt.status !== "CANCELLED" &&
          new Date(appt.slot.startAt).getTime() >= nowMs
      )
      .slice(0, 4);
  }, [appointments, nowMs]);

  return (
    <>
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,3fr)_minmax(0,2fr)] gap-2 overflow-hidden">
        <div className="flex min-h-0 flex-col overflow-hidden">
          <AppointmentCalendarPanel
          monthTitle={formatAppointmentMonthTitle(month, locale)}
          onPrevMonth={() => setMonth((m) => appointmentAddMonths(m, -1))}
          onNextMonth={() => setMonth((m) => appointmentAddMonths(m, 1))}
          prevMonthLabel={labels.homeCalendarPrevMonth}
          nextMonthLabel={labels.homeCalendarNextMonth}
          weekdays={weekdays}
          weeks={weeks}
          homeCompact
          renderDay={(cell) => {
            const dateKey = cell.dateKey!;
            const status = dayStatus(dateKey);
            const selected = dayModalOpen && selectedDay === dateKey;
          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => pickDay(dateKey)}
                className={`${APPOINTMENT_DAY_FRAME_HOME} ${dayClass(status, selected)}`}
                title={
                  status === "full" ? labels.homeCalendarFullDayHint : undefined
                }
              >
                {cell.day}
              </button>
            );
          }}
          />
        </div>

        <div
          className="dashboard-card bakery-float-panel flex min-h-0 flex-col overflow-hidden rounded-[32px] p-3"
          role="region"
          aria-label={labels.homeUpcomingAppointments}
        >
          <h2 className="shrink-0 pb-2 text-center text-[15px] font-extrabold text-bakery-ink">
            {labels.homeUpcomingAppointments}
          </h2>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[18px] bg-transparent p-2 [-webkit-overflow-scrolling:touch]">
            {upcomingAppointments.length === 0 ? (
              <p className="py-4 text-center text-[14px] font-semibold text-bakery-muted">
                {labels.homeNoUpcomingAppointments}
              </p>
            ) : (
              <ul className="space-y-2">
                {upcomingAppointments.map((appt) => (
                  <li key={appt.id}>
                    <DashboardAppointmentCard
                      appointment={appt}
                      bookingByDay={bookingByDay}
                      outlined
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <DashboardDayAppointmentsModal
        open={dayModalOpen}
        onClose={() => {
          setDayModalOpen(false);
          setSelectedDay(null);
        }}
        dateKey={selectedDay}
        slots={selectedDaySlots}
        appointments={selectedDayAppointments}
        bookingByDay={bookingByDay}
      />
    </>
  );
}
