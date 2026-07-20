"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  DashboardOrdersList,
  type DashboardOrderView,
} from "@/components/dashboard/dashboard-order-card";
import { useDashboardCustomerProfile } from "@/components/dashboard/dashboard-customer-profile";
import { AppointmentCalendarPanel } from "@/components/appointment-calendar-panel";
import {
  APPOINTMENT_WEEKDAYS_EN,
  APPOINTMENT_WEEKDAYS_HE,
  appointmentAddMonths,
  appointmentLocalDateKey,
  appointmentStartOfMonth,
  buildAppointmentMonthWeeksFull,
  formatAppointmentDayTitle,
  formatAppointmentMonthTitle,
} from "@/lib/appointment-calendar-shared";
import { mapOrdersFromApi } from "@/components/dashboard-client";

type CalendarView = "month" | "week" | "day";

function localDateKeyFromParts(y: number, monthIndex: number, day: number): string {
  return appointmentLocalDateKey(new Date(y, monthIndex, day).toISOString());
}

function addDaysToKey(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return localDateKeyFromParts(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeekKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - date.getDay());
  return localDateKeyFromParts(date.getFullYear(), date.getMonth(), date.getDate());
}

function todayKey(): string {
  return appointmentLocalDateKey(new Date().toISOString());
}

function formatShortDate(dateKey: string, locale: "he" | "en"): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function DashboardOrdersCalendarCard({
  previewOnly = false,
  previewOrders,
  embedded = false,
}: {
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
  /** Inside an action sheet — sheet panel already provides the frame and title. */
  embedded?: boolean;
}) {
  const { labels, locale } = useAppLocale();
  const [orders, setOrders] = useState<DashboardOrderView[]>(previewOrders ?? []);
  const [orderConfirmationRequired, setOrderConfirmationRequired] = useState(true);
  const [view, setView] = useState<CalendarView>("month");
  const [month, setMonth] = useState(() => appointmentStartOfMonth(new Date()));
  const [weekStart, setWeekStart] = useState(() => startOfWeekKey(todayKey()));
  const [selectedDay, setSelectedDay] = useState(() => todayKey());

  const { openCustomer, modal: customerModal } = useDashboardCustomerProfile({
    previewOnly,
    previewOrders: orders,
  });

  useEffect(() => {
    if (previewOnly) {
      setOrders(previewOrders ?? []);
      return;
    }
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/dashboard/orders");
      const data = await res.json().catch(() => ({}));
      if (!res.ok || cancelled) return;
      setOrders(mapOrdersFromApi(locale, data.orders ?? []));
      if (typeof data.orderConfirmationRequired === "boolean") {
        setOrderConfirmationRequired(data.orderConfirmationRequired);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [previewOnly, previewOrders, locale]);

  const ordersByDay = useMemo(() => {
    const map = new Map<string, DashboardOrderView[]>();
    for (const order of orders) {
      if (!order.createdAt) continue;
      const key = appointmentLocalDateKey(order.createdAt);
      const list = map.get(key) ?? [];
      list.push(order);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );
    }
    return map;
  }, [orders]);

  const weeks = useMemo(() => buildAppointmentMonthWeeksFull(month), [month]);
  const weekdayLabels = locale === "he" ? APPOINTMENT_WEEKDAYS_HE : APPOINTMENT_WEEKDAYS_EN;

  function pickDay(dateKey: string) {
    setSelectedDay(dateKey);
    setView("day");
  }

  function renderMonthDay(cell: { day: number | null; dateKey: string | null }) {
    const dateKey = cell.dateKey!;
    const count = ordersByDay.get(dateKey)?.length ?? 0;
    const isToday = dateKey === todayKey();
    const selected = view === "day" && selectedDay === dateKey;
    return (
      <button
        key={dateKey}
        type="button"
        onClick={() => pickDay(dateKey)}
        className={`relative flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-[12px] border-2 text-[15px] font-extrabold transition ${
          selected
            ? "border-bakery-primary bg-bakery-primary/15 text-bakery-primary"
            : isToday
              ? "border-bakery-primary bg-bakery-primary/8 text-bakery-primary"
              : "border-bakery-border/25 bg-bakery-cream-light/60 text-bakery-ink"
        }`}
      >
        <span>{cell.day}</span>
        {count > 0 ? (
          <span className="rounded-full bg-bakery-primary px-1.5 text-[11px] font-extrabold leading-[1.3] text-bakery-on-primary">
            {count}
          </span>
        ) : (
          <span className="h-[15px]" aria-hidden />
        )}
      </button>
    );
  }

  const weekDayKeys = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDaysToKey(weekStart, i)),
    [weekStart]
  );

  const dayOrders = ordersByDay.get(selectedDay) ?? [];

  const viewToggle = (
    <div className="flex shrink-0 rounded-full border border-bakery-border/30 bg-bakery-input/60 p-0.5">
      {(["month", "week", "day"] as CalendarView[]).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => setView(v)}
          className={`rounded-full px-2.5 py-1 text-[12px] font-extrabold transition ${
            view === v ? "bg-bakery-primary text-bakery-on-primary" : "text-bakery-muted"
          }`}
        >
          {v === "month"
            ? labels.ordersCalendarMonthView
            : v === "week"
              ? labels.ordersCalendarWeekView
              : labels.ordersCalendarDayView}
        </button>
      ))}
    </div>
  );

  const body = (
    <div className="space-y-3">
      {embedded ? (
        <div className="flex justify-center">{viewToggle}</div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[16px] font-extrabold text-bakery-ink">
            {labels.ordersCalendarTitle}
          </h3>
          {viewToggle}
        </div>
      )}

        {view === "month" ? (
          <AppointmentCalendarPanel
            monthTitle={formatAppointmentMonthTitle(month, locale)}
            onPrevMonth={() => setMonth((m) => appointmentAddMonths(m, -1))}
            onNextMonth={() => setMonth((m) => appointmentAddMonths(m, 1))}
            prevMonthLabel={labels.homeCalendarPrevMonth}
            nextMonthLabel={labels.homeCalendarNextMonth}
            weekdays={weekdayLabels}
            weeks={weeks}
            squareDays
            panelClassName="!border-0 !shadow-none !bg-transparent"
            renderDay={renderMonthDay}
          />
        ) : null}

        {view === "week" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setWeekStart((d) => addDaysToKey(d, -7))}
                aria-label={labels.ordersCalendarPrevWeek}
                className="rounded-full border border-bakery-border/30 p-2 text-bakery-ink transition hover:bg-bakery-cream-light/80"
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
              <p className="text-[13px] font-bold text-bakery-muted">
                {formatShortDate(weekDayKeys[0], locale)}
                {" – "}
                {formatShortDate(weekDayKeys[6], locale)}
              </p>
              <button
                type="button"
                onClick={() => setWeekStart((d) => addDaysToKey(d, 7))}
                aria-label={labels.ordersCalendarNextWeek}
                className="rounded-full border border-bakery-border/30 p-2 text-bakery-ink transition hover:bg-bakery-cream-light/80"
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {weekDayKeys.map((dateKey) => {
                const [, , dayNum] = dateKey.split("-").map(Number);
                const dow = new Date(`${dateKey}T00:00:00`).getDay();
                const count = ordersByDay.get(dateKey)?.length ?? 0;
                const isToday = dateKey === todayKey();
                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => pickDay(dateKey)}
                    className={`flex flex-col items-center gap-1 rounded-[12px] border-2 py-2 text-[13px] font-extrabold transition ${
                      isToday
                        ? "border-bakery-primary bg-bakery-primary/8 text-bakery-primary"
                        : "border-bakery-border/25 bg-bakery-cream-light/60 text-bakery-ink"
                    }`}
                  >
                    <span className="text-[11px] font-bold text-bakery-muted">
                      {weekdayLabels[dow]}
                    </span>
                    <span>{dayNum}</span>
                    {count > 0 ? (
                      <span className="rounded-full bg-bakery-primary px-1.5 text-[10px] font-extrabold text-bakery-on-primary">
                        {count}
                      </span>
                    ) : (
                      <span className="h-[15px]" aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {view === "day" ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedDay((d) => addDaysToKey(d, -1))}
                aria-label={labels.ordersCalendarPrevDay}
                className="rounded-full border border-bakery-border/30 p-2 text-bakery-ink transition hover:bg-bakery-cream-light/80"
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
              <p className="text-[14px] font-extrabold text-bakery-ink">
                {formatAppointmentDayTitle(selectedDay, locale)}
              </p>
              <button
                type="button"
                onClick={() => setSelectedDay((d) => addDaysToKey(d, 1))}
                aria-label={labels.ordersCalendarNextDay}
                className="rounded-full border border-bakery-border/30 p-2 text-bakery-ink transition hover:bg-bakery-cream-light/80"
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
            {dayOrders.length === 0 ? (
              <p className="rounded-[16px] border border-bakery-border/25 bg-bakery-cream-light/60 px-4 py-6 text-center text-[13px] font-semibold text-bakery-muted">
                {labels.ordersCalendarNoOrdersDay}
              </p>
            ) : (
              <DashboardOrdersList
                orders={dayOrders}
                onCustomerClick={openCustomer}
                showPrices
                orderConfirmationRequired={orderConfirmationRequired}
              />
            )}
          </div>
        ) : null}
    </div>
  );

  if (embedded) {
    return (
      <>
        {body}
        {customerModal}
      </>
    );
  }

  return (
    <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
      {body}
      {customerModal}
    </div>
  );
}
