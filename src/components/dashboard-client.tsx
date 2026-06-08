"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ClipboardList, History } from "lucide-react";
import {
  Button,
  Input,
  Panel,
  PageTitle,
} from "@/components/ui";
import {
  DashboardOrdersList,
  DashboardOrdersSection,
  type DashboardOrderView,
} from "@/components/dashboard/dashboard-order-card";
import {
  DashboardAppointmentCard,
  type DashboardAppointmentView,
} from "@/components/dashboard/dashboard-appointment-card";
import {
  type CustomerProfileInput,
  useDashboardCustomerProfile,
} from "@/components/dashboard/dashboard-customer-profile";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { getDashboardLabels, type AppLocale } from "@/lib/app-locale";
import { DASHBOARD_PAGE_ROOT } from "@/components/dashboard/dashboard-panel-frame";
import { splitSellerAppointments } from "@/lib/seller-appointment-history";
export { ProductsManager } from "@/components/dashboard/products-manager";

const appointmentsListClassName =
  "no-scrollbar mt-2 max-h-[50vh] overflow-y-auto overscroll-contain rounded-[18px] border border-bakery-border/40 bg-bakery-input p-2 shadow-[var(--shadow-bakery-card)] [-webkit-overflow-scrolling:touch]";

function AppointmentsList({
  appointments,
  emptyMessage,
  onHide,
  onCustomerClick,
  bookingByDay = false,
}: {
  appointments: DashboardAppointmentView[];
  emptyMessage: string;
  onHide?: (appointmentId: string) => void;
  onCustomerClick?: (input: CustomerProfileInput) => void;
  bookingByDay?: boolean;
}) {
  if (appointments.length === 0) {
    return (
      <p className="py-4 text-center text-[14px] font-semibold text-bakery-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {appointments.map((appointment) => (
        <li key={appointment.id}>
          <DashboardAppointmentCard
            appointment={appointment}
            onHide={
              onHide ? () => onHide(appointment.id) : undefined
            }
            onCustomerClick={onCustomerClick}
            bookingByDay={bookingByDay}
          />
        </li>
      ))}
    </ul>
  );
}

function orderStatusLabel(status: string, locale: AppLocale): string {
  const labels = getDashboardLabels(locale);
  const map: Record<string, string> = {
    PENDING: labels.pending,
    CONFIRMED: labels.confirmed,
    COMPLETED: labels.completed,
    CANCELLED: labels.cancelled,
  };
  return map[status] ?? status;
}

/** רק ממתין דורש פעולה; אושר/הושלם/בוטל — בהיסטוריה */
const ACTIVE_ORDER_STATUSES = new Set(["PENDING"]);

function isActiveOrderStatus(status: string) {
  return ACTIVE_ORDER_STATUSES.has(status);
}

function normalizeCustomerPhone(phone: string) {
  return phone.replace(/\s/g, "");
}

function enrichOrdersWithCustomerJoinedAt(
  orders: DashboardOrderView[]
): DashboardOrderView[] {
  const firstOrderByPhone = new Map<string, string>();
  for (const order of orders) {
    if (!order.createdAt) continue;
    const phone = normalizeCustomerPhone(order.customerPhone);
    const existing = firstOrderByPhone.get(phone);
    if (
      !existing ||
      new Date(order.createdAt).getTime() < new Date(existing).getTime()
    ) {
      firstOrderByPhone.set(phone, order.createdAt);
    }
  }
  return orders.map((order) => ({
    ...order,
    customerJoinedAt:
      order.customerJoinedAt ??
      firstOrderByPhone.get(normalizeCustomerPhone(order.customerPhone)) ??
      order.createdAt,
  }));
}

function mapOrdersFromApi(
  locale: AppLocale,
  raw: {
    id: string;
    customerName: string;
    customerPhone: string;
    status: string;
    createdAt: string;
    items: {
      quantity: number;
      priceAtOrder: number;
      product: { name: string; imageUrl: string | null };
    }[];
  }[]
): DashboardOrderView[] {
  return enrichOrdersWithCustomerJoinedAt(
    raw.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      status: o.status,
      statusLabel: orderStatusLabel(o.status, locale),
      createdAt: o.createdAt,
      items: o.items.map((it) => ({
        name: it.product.name,
        quantity: it.quantity,
        lineTotal: it.priceAtOrder * it.quantity,
        imageUrl: it.product.imageUrl,
      })),
    }))
  );
}

function OrdersPanels({
  orders,
  onStatusChange,
  onCustomerClick,
  customerModal,
}: {
  orders: DashboardOrderView[];
  onStatusChange?: (orderId: string, status: string) => void;
  onCustomerClick?: ReturnType<
    typeof useDashboardCustomerProfile
  >["openCustomer"];
  customerModal?: React.ReactNode;
}) {
  const { labels } = useAppLocale();
  const activeOrders = orders.filter((o) => isActiveOrderStatus(o.status));
  const historyOrders = orders.filter((o) => !isActiveOrderStatus(o.status));

  return (
    <div className="space-y-5 pb-2">
      <DashboardOrdersSection
        title={labels.activeOrders}
        orders={activeOrders}
        onStatusChange={onStatusChange}
        onCustomerClick={onCustomerClick}
        customerModal={customerModal}
        emptyMessage={labels.noActiveOrders}
      />
      <DashboardOrdersSection
        title={labels.orderHistory}
        orders={historyOrders}
        onCustomerClick={onCustomerClick}
        emptyMessage={labels.noOrderHistory}
      />
    </div>
  );
}

export function OrdersManager({
  framed = true,
  previewOnly = false,
  previewOrders,
}: {
  /** מסגרת לבנה כמו דף פעולות */
  framed?: boolean;
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
}) {
  const [orders, setOrders] = useState<DashboardOrderView[]>(previewOrders ?? []);
  const [activeOrdersOpen, setActiveOrdersOpen] = useState(false);
  const [historyOrdersOpen, setHistoryOrdersOpen] = useState(false);
  const { labels, locale } = useAppLocale();

  async function load() {
    if (previewOnly) return;
    const res = await fetch("/api/dashboard/orders");
    const data = await res.json();
    if (!res.ok) return;
    const mapped = mapOrdersFromApi(locale, data.orders ?? []);
    setOrders(mapped);
  }

  useEffect(() => {
    if (previewOnly && previewOrders) {
      setOrders(
        enrichOrdersWithCustomerJoinedAt(
          previewOrders.map((o) => ({
            ...o,
            statusLabel: orderStatusLabel(o.status, locale),
          }))
        )
      );
      return;
    }
    void load();
  }, [locale, previewOnly, previewOrders]);

  async function setStatus(orderId: string, status: string) {
    if (previewOnly) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status,
                statusLabel: orderStatusLabel(status, locale),
              }
            : o
        )
      );
      return;
    }
    await fetch("/api/dashboard/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    load();
  }

  const activeOrders = orders.filter((o) => isActiveOrderStatus(o.status));
  const historyOrders = orders.filter((o) => !isActiveOrderStatus(o.status));
  const onStatusChange = setStatus;
  const { openCustomer, modal: customerModal } = useDashboardCustomerProfile({
    previewOnly,
    previewOrders: orders,
  });

  const panels = (
    <OrdersPanels
      orders={orders}
      onStatusChange={onStatusChange}
      onCustomerClick={openCustomer}
      customerModal={customerModal}
    />
  );

  if (!framed) {
    return <div className="space-y-4 text-center">{panels}</div>;
  }

  const ordersListClassName =
    "no-scrollbar mt-2 max-h-[50vh] overflow-y-auto overscroll-contain rounded-[18px] border border-bakery-border/40 bg-bakery-input p-2 shadow-[var(--shadow-bakery-card)] [-webkit-overflow-scrolling:touch]";

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} gap-2`}>
      {previewOnly && (
        <p className="shrink-0 rounded-[14px] border border-amber-300/50 bg-amber-50/90 px-3 py-2 text-center text-[13px] font-bold text-amber-950">
          תצוגה מקדימה — הזמנות דמו לבדיקה, השינויים לא נשמרים בשרת
        </p>
      )}
      <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
        <button
          type="button"
          onClick={() => setActiveOrdersOpen((v) => !v)}
          aria-expanded={activeOrdersOpen}
          aria-controls="dashboard-active-orders-list"
          className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
            activeOrdersOpen ? "bakery-float-tile--active" : ""
          }`}
        >
          <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <ClipboardList className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
            {labels.orders}
            {activeOrders.length > 0 && (
              <span className="font-semibold text-bakery-muted">
                {" "}
                ({activeOrders.length})
              </span>
            )}
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform duration-200 ${
              activeOrdersOpen ? "rotate-180" : ""
            }`}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>

        {activeOrdersOpen && (
          <div
            id="dashboard-active-orders-list"
            className={ordersListClassName}
            role="region"
            aria-label={labels.orders}
          >
            <DashboardOrdersList
              orders={activeOrders}
              onStatusChange={onStatusChange}
              onCustomerClick={openCustomer}
              emptyMessage={labels.noActiveOrders}
              emptyCompact
            />
          </div>
        )}
      </div>

      <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
        <button
          type="button"
          onClick={() => setHistoryOrdersOpen((v) => !v)}
          aria-expanded={historyOrdersOpen}
          aria-controls="dashboard-order-history-list"
          className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
            historyOrdersOpen ? "bakery-float-tile--active" : ""
          }`}
        >
          <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <History className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
            {labels.orderHistory}
            {historyOrders.length > 0 && (
              <span className="font-semibold text-bakery-muted">
                {" "}
                ({historyOrders.length})
              </span>
            )}
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform duration-200 ${
              historyOrdersOpen ? "rotate-180" : ""
            }`}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>

        {historyOrdersOpen && (
          <div
            id="dashboard-order-history-list"
            className={ordersListClassName}
            role="region"
            aria-label={labels.orderHistory}
          >
            <DashboardOrdersList
              orders={historyOrders}
              onCustomerClick={openCustomer}
              emptyMessage={labels.noOrderHistory}
              emptyCompact
              showPrices
            />
          </div>
        )}
      </div>
      {customerModal}
    </div>
  );
}

export function SlotsManager({
  previewOnly = false,
  initialSlots = [],
}: {
  previewOnly?: boolean;
  initialSlots?: {
    id: string;
    startAt: string;
    endAt: string;
    maxBookings: number;
    appointments: unknown[];
  }[];
} = {}) {
  const { labels, formatDateTime } = useAppLocale();
  const [slots, setSlots] = useState(initialSlots);

  async function load() {
    const res = await fetch("/api/dashboard/slots");
    const data = await res.json();
    if (res.ok) setSlots(data.slots);
  }

  useEffect(() => {
    if (previewOnly) {
      setSlots(initialSlots);
      return;
    }
    load();
  }, [previewOnly, initialSlots]);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (previewOnly) {
      e.currentTarget.reset();
      return;
    }
    const fd = new FormData(e.currentTarget);
    const start = new Date(fd.get("startAt") as string);
    const end = new Date(fd.get("endAt") as string);
    await fetch("/api/dashboard/slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        maxBookings: Number(fd.get("maxBookings") || 1),
      }),
    });
    e.currentTarget.reset();
    load();
  }

  async function remove(id: string) {
    if (previewOnly) {
      setSlots((prev) => prev.filter((s) => s.id !== id));
      return;
    }
    await fetch(`/api/dashboard/slots/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-5">
      <PageTitle>{labels.limits}</PageTitle>
      <Panel>
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-2">
          <Input
            name="startAt"
            label={labels.slotStart}
            type="datetime-local"
            required
            dir="ltr"
          />
          <Input
            name="endAt"
            label={labels.slotEnd}
            type="datetime-local"
            required
            dir="ltr"
          />
          <Input
            name="maxBookings"
            label={labels.maxOrders}
            type="number"
            defaultValue={1}
            min={1}
            dir="ltr"
          />
          <Button type="submit">{labels.addProduct}</Button>
        </form>
      </Panel>
      <ul className="space-y-2">
        {slots.map((s) => (
          <Panel key={s.id} className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[14px] font-medium" dir="ltr">
              {formatDateTime(s.startAt)} — {formatDateTime(s.endAt)} (
              {s.appointments.length}/{s.maxBookings})
            </span>
            <Button variant="danger" onClick={() => remove(s.id)}>
              {labels.delete}
            </Button>
          </Panel>
        ))}
      </ul>
    </div>
  );
}

export function AppointmentsManager({
  framed = true,
  previewOnly = false,
  initialAppointments = [],
  initialBookingByDay = false,
  historyOnly = false,
}: {
  framed?: boolean;
  previewOnly?: boolean;
  initialAppointments?: DashboardAppointmentView[];
  initialBookingByDay?: boolean;
  historyOnly?: boolean;
} = {}) {
  const { labels } = useAppLocale();
  const [items, setItems] = useState(initialAppointments);
  const [bookingByDay, setBookingByDay] = useState(initialBookingByDay);
  const [activeOpen, setActiveOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  async function load() {
    const [apptsRes, calendarRes] = await Promise.all([
      fetch("/api/dashboard/appointments"),
      fetch("/api/dashboard/appointment-calendar"),
    ]);
    const apptsData = await apptsRes.json().catch(() => ({}));
    const calendarData = await calendarRes.json().catch(() => ({}));
    if (apptsRes.ok) setItems(apptsData.appointments);
    if (calendarRes.ok) {
      setBookingByDay(
        Boolean(
          (calendarData as { config?: { bookingByDay?: boolean } }).config
            ?.bookingByDay
        )
      );
    }
  }

  useEffect(() => {
    if (previewOnly) {
      setItems(initialAppointments);
      setBookingByDay(initialBookingByDay);
      return;
    }
    void load();
  }, [previewOnly, initialAppointments, initialBookingByDay]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const { active, history } = useMemo(
    () => splitSellerAppointments(items, nowMs),
    [items, nowMs]
  );

  const appointmentCustomerOrders = useMemo(
    (): DashboardOrderView[] =>
      items.map((appt) => ({
        id: appt.id,
        customerName: appt.customerName,
        customerPhone: appt.customerPhone,
        status: appt.status,
        statusLabel: appt.status,
        createdAt: appt.slot.startAt,
        items: [],
      })),
    [items]
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

  async function hideAppointment(appointmentId: string) {
    if (previewOnly) {
      setItems((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                sellerHiddenAt: new Date().toISOString(),
              }
            : appointment
        )
      );
      return;
    }

    await fetch("/api/dashboard/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, hide: true }),
    });
    void load();
  }

  if (historyOnly) {
    return (
      <div className={`${DASHBOARD_PAGE_ROOT} gap-2`}>
        {previewOnly && (
          <p className="shrink-0 rounded-[14px] border border-amber-300/50 bg-amber-50/90 px-3 py-2 text-center text-[13px] font-bold text-amber-950">
            תצוגה מקדימה — התורים הם דמו לבדיקה, השינויים לא נשמרים בשרת
          </p>
        )}
        <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
          <h2 className="pb-2 text-center text-[17px] font-extrabold text-bakery-ink">
            {labels.appointmentHistory}
            {history.length > 0 && (
              <span className="font-semibold text-bakery-muted">
                {" "}
                ({history.length})
              </span>
            )}
          </h2>
          <div
            className={appointmentsListClassName}
            role="region"
            aria-label={labels.appointmentHistory}
          >
            <AppointmentsList
              appointments={history}
              emptyMessage={labels.noAppointmentHistory}
              onCustomerClick={openCustomer}
              bookingByDay={bookingByDay}
            />
          </div>
        </div>
        {customerModal}
      </div>
    );
  }

  const panels = (
    <>
      <AppointmentsList
        appointments={active}
        emptyMessage={labels.noActiveAppointments}
        onHide={hideAppointment}
        onCustomerClick={openCustomer}
        bookingByDay={bookingByDay}
      />
      <AppointmentsList
        appointments={history}
        emptyMessage={labels.noAppointmentHistory}
        onCustomerClick={openCustomer}
        bookingByDay={bookingByDay}
      />
      {customerModal}
    </>
  );

  if (!framed) {
    return <div className="space-y-4 text-center">{panels}</div>;
  }

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} gap-2`}>
      {previewOnly && (
        <p className="shrink-0 rounded-[14px] border border-amber-300/50 bg-amber-50/90 px-3 py-2 text-center text-[13px] font-bold text-amber-950">
          תצוגה מקדימה — התורים הם דמו לבדיקה, השינויים לא נשמרים בשרת
        </p>
      )}

      <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
        <button
          type="button"
          onClick={() => setActiveOpen((open) => !open)}
          aria-expanded={activeOpen}
          aria-controls="dashboard-active-appointments-list"
          className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
            activeOpen ? "bakery-float-tile--active" : ""
          }`}
        >
          <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <ClipboardList className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
            {labels.activeAppointments}
            {active.length > 0 && (
              <span className="font-semibold text-bakery-muted">
                {" "}
                ({active.length})
              </span>
            )}
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform duration-200 ${
              activeOpen ? "rotate-180" : ""
            }`}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>

        {activeOpen && (
          <div
            id="dashboard-active-appointments-list"
            className={appointmentsListClassName}
            role="region"
            aria-label={labels.activeAppointments}
          >
            <AppointmentsList
              appointments={active}
              emptyMessage={labels.noActiveAppointments}
              onHide={hideAppointment}
              onCustomerClick={openCustomer}
              bookingByDay={bookingByDay}
            />
          </div>
        )}
      </div>

      <div className="dashboard-card bakery-float-panel mt-auto min-h-0 shrink-0 rounded-[32px] p-3">
        <button
          type="button"
          onClick={() => setHistoryOpen((open) => !open)}
          aria-expanded={historyOpen}
          aria-controls="dashboard-appointment-history-list"
          className={`dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition ${
            historyOpen ? "bakery-float-tile--active" : ""
          }`}
        >
          <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
            <History className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1 text-[16px] font-extrabold leading-tight text-bakery-ink">
            {labels.appointmentHistory}
            {history.length > 0 && (
              <span className="font-semibold text-bakery-muted">
                {" "}
                ({history.length})
              </span>
            )}
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform duration-200 ${
              historyOpen ? "rotate-180" : ""
            }`}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>

        {historyOpen && (
          <div
            id="dashboard-appointment-history-list"
            className={appointmentsListClassName}
            role="region"
            aria-label={labels.appointmentHistory}
          >
            <AppointmentsList
              appointments={history}
              emptyMessage={labels.noAppointmentHistory}
              onCustomerClick={openCustomer}
              bookingByDay={bookingByDay}
            />
          </div>
        )}
      </div>

      {customerModal}
    </div>
  );
}

export { DashboardInquiriesManager as InquiriesManager } from "@/components/dashboard/dashboard-inquiries-manager";

export function LogoutButton() {
  const { labels } = useAppLocale();
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      {labels.logout}
    </Button>
  );
}
