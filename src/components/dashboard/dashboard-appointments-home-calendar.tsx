"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  APPOINTMENT_DAY_FRAME_SQUARE_LARGE,
  AppointmentCalendarPanel,
} from "@/components/appointment-calendar-panel";
import { splitSellerAppointments } from "@/lib/seller-appointment-history";
import {
  SELLER_SELF_BOOKING_NOTE,
  SELLER_WALK_IN_PHONE,
  slotHasNoBookings,
} from "@/lib/seller-appointment-booking";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  DASHBOARD_DAY_PANEL_HALO,
  DashboardAppointmentCard,
} from "@/components/dashboard/dashboard-appointment-card";
import {
  useDashboardCustomerProfile,
  type CustomerProfileInput,
} from "@/components/dashboard/dashboard-customer-profile";
import type { DashboardOrderView } from "@/components/dashboard/dashboard-order-card";
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

function DashboardHomeCalendarModal({
  open,
  onClose,
  month,
  onPrevMonth,
  onNextMonth,
  weekdays,
  weeks,
  renderDay,
  labels,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  month: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  weekdays: string[];
  weeks: ReturnType<typeof buildAppointmentMonthCells>[];
  renderDay: (cell: { day: number | null; dateKey: string | null }) => ReactNode;
  labels: {
    homeCalendarTitle: string;
    homeCalendarPrevMonth: string;
    homeCalendarNextMonth: string;
    close: string;
  };
  locale: "he" | "en";
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3"
      role="dialog"
      aria-modal="true"
      aria-label={labels.homeCalendarTitle}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={labels.close}
      />
      <div className="relative flex max-h-[min(94dvh,780px)] w-full max-w-[min(100%,400px)] flex-col overflow-hidden rounded-[28px] border border-[#5C4A3E]/25 bg-[#D2B88E] shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
        <div className="relative flex min-h-[56px] shrink-0 items-center justify-center border-b border-bakery-border/25 px-12 py-3.5">
          <h2 className="w-full text-center text-[22px] font-extrabold leading-tight text-bakery-ink sm:text-[24px]">
            {labels.homeCalendarTitle}
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
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 py-1">
          <AppointmentCalendarPanel
            monthTitle={formatAppointmentMonthTitle(month, locale)}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            prevMonthLabel={labels.homeCalendarPrevMonth}
            nextMonthLabel={labels.homeCalendarNextMonth}
            weekdays={weekdays}
            weeks={weeks}
            squareDaysLarge
            renderDay={renderDay}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

function DashboardDayAppointmentsModal({
  open,
  onClose,
  dateKey,
  slots,
  appointments,
  bookingByDay = false,
  onQuickBookSlot,
  bookingSlotId = null,
  onCustomerClick,
}: {
  open: boolean;
  onClose: () => void;
  dateKey: string | null;
  slots: CalendarSlot[];
  appointments: SellerHomeAppointment[];
  bookingByDay?: boolean;
  onQuickBookSlot?: (slotId: string) => void | Promise<void>;
  bookingSlotId?: string | null;
  onCustomerClick?: (input: CustomerProfileInput) => void;
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
  const bookableSlots = sortedSlots.filter(
    (slot) => calendarSlotIsOpen(slot) && slotHasNoBookings(slot)
  );
  const dayAppointments = [...appointments]
    .filter((appt) => appt.status !== "CANCELLED")
    .sort(
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
                {labels.homeCalendarBookedAppointments}
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
                        outlined
                        onCustomerClick={onCustomerClick}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="space-y-2">
              <h3 className="text-center text-[13px] font-bold text-bakery-muted">
                {labels.homeCalendarOpenAppointments}
              </h3>
              {bookableSlots.length === 0 ? (
                <p className="rounded-[16px] border border-bakery-border/30 bg-bakery-card/70 px-4 py-4 text-center text-[14px] font-semibold text-bakery-muted">
                  {labels.homeCalendarNoSlotsDay}
                </p>
              ) : (
                <ul className="space-y-2">
                  {bookableSlots.map((slot) => {
                    const isBooking = bookingSlotId === slot.id;
                    const startTime = formatAppointmentSlotTime(
                      slot.startAt,
                      locale
                    );
                    const endTime = formatAppointmentSlotTime(
                      slot.endAt,
                      locale
                    );
                    return (
                      <li key={slot.id}>
                        <button
                          type="button"
                          onClick={() => onQuickBookSlot?.(slot.id)}
                          disabled={!onQuickBookSlot || isBooking}
                          dir="ltr"
                          className={`dashboard-action-square flex w-full items-center gap-2 rounded-[22px] px-3 py-3.5 text-start transition hover:opacity-95 active:scale-[0.99] disabled:opacity-60 !border-[3px] !border-[#5C4A3E]/18 ${DASHBOARD_DAY_PANEL_HALO}`}
                          aria-label={`${labels.homeCalendarQuickBook}: ${startTime} – ${endTime}`}
                        >
                          <p className="w-[4.25rem] shrink-0 text-[12px] font-extrabold leading-tight text-bakery-muted">
                            {labels.homeCalendarSlotOpen}
                          </p>

                          <div className="flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border-[2px] border-bakery-border/40 bg-[#F2EBE0] px-0.5 shadow-[0_2px_8px_rgba(58,47,38,0.08)]">
                            <span
                              className="w-full text-center text-[12px] font-extrabold leading-none tabular-nums text-bakery-ink"
                              dir="ltr"
                            >
                              {startTime}
                            </span>
                          </div>

                          <p
                            className="min-w-0 flex-1 truncate text-center text-[13px] font-bold tabular-nums text-bakery-ink"
                            dir="ltr"
                          >
                            <span className="text-bakery-muted">–</span>{" "}
                            {endTime}
                          </p>

                          <p
                            className="min-w-0 max-w-[38%] truncate text-right text-[15px] font-extrabold leading-tight text-bakery-primary"
                            dir="rtl"
                          >
                            {isBooking
                              ? labels.saving
                              : labels.homeCalendarQuickBook}
                          </p>

                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-bakery-border/35 bg-bakery-primary text-[20px] font-extrabold leading-none text-bakery-on-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]"
                            aria-hidden
                          >
                            +
                          </span>
                        </button>
                      </li>
                    );
                  })}
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
  initialReferenceNowMs,
}: {
  previewOnly?: boolean;
  initialSlots?: CalendarSlot[];
  initialAppointments?: SellerHomeAppointment[];
  initialBookingByDay?: boolean;
  /** Server-frozen clock for preview SSR/hydration parity. */
  initialReferenceNowMs?: number;
}) {
  const { labels, locale } = useAppLocale();
  const [hydrated, setHydrated] = useState(false);
  const [month, setMonth] = useState(() => appointmentStartOfMonth(new Date()));
  const [slots, setSlots] = useState(initialSlots);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [bookingByDay, setBookingByDay] = useState(initialBookingByDay);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);
  const bookingInFlightRef = useRef(new Set<string>());
  const [nowMs, setNowMs] = useState(() => initialReferenceNowMs ?? 0);

  useEffect(() => {
    setHydrated(true);
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const todayKey = hydrated
    ? appointmentLocalDateKey(new Date(nowMs).toISOString())
    : "";

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

  const quickBookSlot = useCallback(
    async (slotId: string) => {
      if (bookingInFlightRef.current.has(slotId)) return;

      const slot = slots.find((s) => s.id === slotId);
      if (
        !slot ||
        !calendarSlotIsOpen(slot) ||
        !slotHasNoBookings(slot)
      ) {
        return;
      }

      bookingInFlightRef.current.add(slotId);
      setBookingSlotId(slotId);

      const pendingId = previewOnly
        ? `preview-${slotId}-${Date.now()}`
        : `pending-${slotId}`;
      const optimisticAppt: SellerHomeAppointment = {
        id: pendingId,
        customerName: labels.sellerSelfBooking,
        customerPhone: SELLER_WALK_IN_PHONE,
        status: "CONFIRMED",
        notes: SELLER_SELF_BOOKING_NOTE,
        slot: { startAt: slot.startAt, endAt: slot.endAt },
      };

      setAppointments((prev) => [...prev, optimisticAppt]);
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId
            ? { ...s, appointments: [...s.appointments, { id: pendingId }] }
            : s
        )
      );

      const rollback = () => {
        setAppointments((prev) => prev.filter((a) => a.id !== pendingId));
        setSlots((prev) =>
          prev.map((s) =>
            s.id === slotId
              ? {
                  ...s,
                  appointments: s.appointments.filter(
                    (a) =>
                      (a as { id?: string }).id !== pendingId
                  ),
                }
              : s
          )
        );
      };

      try {
        if (previewOnly) return;

        const res = await fetch("/api/dashboard/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slotId }),
        });
        if (!res.ok) {
          rollback();
          return;
        }

        const [slotsRes, apptsRes] = await Promise.all([
          fetch("/api/dashboard/slots"),
          fetch("/api/dashboard/appointments"),
        ]);
        const slotsData = await slotsRes.json().catch(() => ({}));
        const apptsData = await apptsRes.json().catch(() => ({}));
        if (slotsRes.ok) {
          setSlots((slotsData as { slots?: CalendarSlot[] }).slots ?? []);
        }
        if (apptsRes.ok) {
          setAppointments(
            (apptsData as { appointments?: SellerHomeAppointment[] })
              .appointments ?? []
          );
        }
      } finally {
        bookingInFlightRef.current.delete(slotId);
        setBookingSlotId(null);
      }
    },
    [labels.sellerSelfBooking, previewOnly, slots]
  );

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
    setCalendarModalOpen(false);
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
    const referenceMs = hydrated
      ? nowMs
      : (initialReferenceNowMs ?? nowMs);
    const { active } = splitSellerAppointments(appointments, referenceMs);
    return active.filter((appt) => appt.status !== "CANCELLED");
  }, [appointments, nowMs, hydrated, initialReferenceNowMs]);

  const appointmentCustomerOrders = useMemo(
    (): DashboardOrderView[] =>
      appointments.map((appt) => ({
        id: appt.id,
        customerName: appt.customerName,
        customerPhone: appt.customerPhone,
        status: appt.status,
        statusLabel: appt.status,
        createdAt: appt.slot.startAt,
        items: [],
      })),
    [appointments]
  );

  const { openCustomer, modal: customerModal } = useDashboardCustomerProfile({
    previewOnly,
    previewOrders: previewOnly ? appointmentCustomerOrders : undefined,
    supplementalOrderSources: previewOnly
      ? undefined
      : appointmentCustomerOrders.map((order) => ({
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          createdAt: order.createdAt,
          status: order.status,
        })),
  });

  function renderCalendarDay(cell: { day: number | null; dateKey: string | null }) {
    const dateKey = cell.dateKey!;
    const status = dayStatus(dateKey);
    const selected = dayModalOpen && selectedDay === dateKey;
    const isToday = dateKey === todayKey;
    return (
      <button
        key={dateKey}
        type="button"
        onClick={() => pickDay(dateKey)}
        className={`${APPOINTMENT_DAY_FRAME_SQUARE_LARGE} ${dayClass(status, selected)}${
          isToday
            ? " outline outline-[3px] outline-black outline-offset-0"
            : ""
        }`}
        title={status === "full" ? labels.homeCalendarFullDayHint : undefined}
      >
        {cell.day}
      </button>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="dashboard-card bakery-float-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] p-3"
          role="region"
          aria-label={labels.homeUpcomingAppointments}
        >
          <h2 className="shrink-0 pb-2 text-center text-[16px] font-extrabold text-bakery-ink sm:text-[17px]">
            {labels.homeUpcomingAppointments}
          </h2>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[18px] bg-transparent p-2 [-webkit-overflow-scrolling:touch]">
            {upcomingAppointments.length === 0 ? (
              <p className="py-6 text-center text-[14px] font-semibold text-bakery-muted">
                {labels.homeNoUpcomingAppointments}
              </p>
            ) : (
              <ul className="space-y-2">
                {upcomingAppointments.map((appt, index) => (
                  <li key={appt.id}>
                    <DashboardAppointmentCard
                      appointment={appt}
                      bookingByDay={bookingByDay}
                      outlined
                      highlightAsNext={hydrated && index === 0}
                      relativeDateLabels={hydrated}
                      onCustomerClick={openCustomer}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="shrink-0 px-1 pb-0.5 pt-2">
            <div className="dashboard-home-header dashboard-home-header--compact">
              <div className="dashboard-home-header__inner text-center px-2.5 py-2">
                <button
                  type="button"
                  onClick={() => setCalendarModalOpen(true)}
                  className="dashboard-home-store-link dashboard-home-store-link--compact"
                  aria-label={labels.homeOpenCalendar}
                >
                  <span className="block min-w-0 truncate font-extrabold text-[17px] sm:text-[18px]">
                    {labels.homeOpenCalendar}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardHomeCalendarModal
        open={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        month={month}
        onPrevMonth={() => setMonth((m) => appointmentAddMonths(m, -1))}
        onNextMonth={() => setMonth((m) => appointmentAddMonths(m, 1))}
        weekdays={weekdays}
        weeks={weeks}
        renderDay={renderCalendarDay}
        labels={{
          homeCalendarTitle: labels.homeCalendarTitle,
          homeCalendarPrevMonth: labels.homeCalendarPrevMonth,
          homeCalendarNextMonth: labels.homeCalendarNextMonth,
          close: labels.close,
        }}
        locale={locale}
      />

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
        onQuickBookSlot={quickBookSlot}
        bookingSlotId={bookingSlotId}
        onCustomerClick={openCustomer}
      />

      {customerModal}
    </>
  );
}
