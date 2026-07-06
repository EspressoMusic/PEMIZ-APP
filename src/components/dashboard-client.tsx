"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, History, Search, X } from "lucide-react";
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
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardActionRowButton } from "@/components/dashboard/dashboard-action-row";
import { getDashboardLabels, type AppLocale } from "@/lib/app-locale";
import { DASHBOARD_PAGE_ROOT } from "@/components/dashboard/dashboard-panel-frame";
import { splitSellerAppointments } from "@/lib/seller-appointment-history";
export { ProductsManager } from "@/components/dashboard/products-manager";

const appointmentsListClassName =
  "no-scrollbar mt-2 max-h-[50vh] overflow-y-auto overscroll-contain rounded-[18px] border border-bakery-border/40 bg-bakery-input p-2 shadow-[var(--shadow-bakery-card)] [-webkit-overflow-scrolling:touch]";

const appointmentsModalListClassName =
  "no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[18px] border border-bakery-border/40 bg-bakery-input p-2 shadow-[var(--shadow-bakery-card)] [-webkit-overflow-scrolling:touch]";

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

/** ממתין נשאר פעיל; אושר/הושלם/בוטל עוברים אוטומטית להיסטוריה ולעולם לא נמחקים */
const ACTIVE_ORDER_STATUSES = new Set(["PENDING"]);

function isActiveOrderStatus(status: string) {
  return ACTIVE_ORDER_STATUSES.has(status);
}

function orderMatchesDate(order: DashboardOrderView, dateStr: string): boolean {
  if (!order.createdAt) return false;
  const d = new Date(order.createdAt);
  if (Number.isNaN(d.getTime())) return false;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}` === dateStr;
}

function filterOrdersBySearch(
  orders: DashboardOrderView[],
  query: string,
  dateStr = ""
): DashboardOrderView[] {
  let result = orders;
  const q = query.trim().toLowerCase();
  if (q) {
    const numQuery = q.replace(/^#/, "");
    result = result.filter((order) => {
      if (order.customerName.toLowerCase().includes(q)) return true;
      if (
        order.orderNumber != null &&
        String(order.orderNumber).includes(numQuery)
      ) {
        return true;
      }
      return false;
    });
  }
  if (dateStr) {
    result = result.filter((order) => orderMatchesDate(order, dateStr));
  }
  return result;
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
    orderNumber?: number;
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
      orderNumber: o.orderNumber,
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

const ordersModalListClassName =
  "no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-[18px] border border-bakery-border/40 bg-bakery-input p-2 shadow-[var(--shadow-bakery-card)] [-webkit-overflow-scrolling:touch]";

function useOrdersSheetSearch(open: boolean) {
  const { labels } = useAppLocale();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    if (!open) {
      setSearchOpen(false);
      setSearchQuery("");
      setSearchDate("");
    }
  }, [open]);

  const hasSearchQuery = searchQuery.trim().length > 0 || searchDate.length > 0;

  const headerEndAction = searchOpen ? (
    <button
      type="button"
      onClick={() => {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchDate("");
      }}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-bakery-ink transition hover:bg-bakery-cream-light/80 active:opacity-80"
      aria-label={labels.close}
    >
      <X className="h-5 w-5" strokeWidth={2.5} />
    </button>
  ) : (
    <button
      type="button"
      onClick={() => setSearchOpen(true)}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full text-bakery-ink transition hover:bg-bakery-cream-light/80 active:opacity-80"
      aria-label={labels.searchOrders}
    >
      <Search className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );

  const searchField = searchOpen ? (
    <div className="mb-2 flex items-center gap-2 px-0.5">
      <div className="min-w-0 flex-1">
        <Input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={labels.searchOrdersPlaceholder}
          autoFocus
          className="rounded-[14px] border-bakery-border/40 bg-bakery-on-primary text-[15px] font-semibold"
          aria-label={labels.searchOrdersPlaceholder}
        />
      </div>
      <div className="w-[152px] shrink-0">
        <Input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="rounded-[14px] border-bakery-border/40 bg-bakery-on-primary text-[15px] font-semibold"
          aria-label={labels.filterOrdersByDate}
          title={labels.filterOrdersByDate}
        />
      </div>
    </div>
  ) : null;

  return {
    headerEndAction,
    searchField,
    searchQuery,
    searchDate,
    hasSearchQuery,
  };
}

function OrdersPreviewBanner() {
  return (
    <p className="shrink-0 rounded-[14px] border border-amber-300/50 bg-amber-50/90 px-3 py-2 text-center text-[13px] font-bold text-amber-950">
      תצוגה מקדימה — הזמנות דמו לבדיקה, השינויים לא נשמרים בשרת
    </p>
  );
}

function useOrdersManager({
  previewOnly = false,
  previewOrders,
}: {
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
}) {
  const [orders, setOrders] = useState<DashboardOrderView[]>(previewOrders ?? []);
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
  const { openCustomer, modal: customerModal } = useDashboardCustomerProfile({
    previewOnly,
    previewOrders: orders,
  });

  return {
    labels,
    activeOrders,
    historyOrders,
    setStatus,
    openCustomer,
    customerModal,
    previewOnly,
  };
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

function OrdersActiveSheet({
  open,
  onClose,
  activeOrders,
  onStatusChange,
  onCustomerClick,
  previewOnly,
}: {
  open: boolean;
  onClose: () => void;
  activeOrders: DashboardOrderView[];
  onStatusChange: (orderId: string, status: string) => void;
  onCustomerClick: ReturnType<typeof useDashboardCustomerProfile>["openCustomer"];
  previewOnly?: boolean;
}) {
  const { labels } = useAppLocale();
  const { headerEndAction, searchField, searchQuery, searchDate, hasSearchQuery } =
    useOrdersSheetSearch(open);
  const filteredOrders = useMemo(
    () => filterOrdersBySearch(activeOrders, searchQuery, searchDate),
    [activeOrders, searchQuery, searchDate]
  );

  return (
    <DashboardActionSheet
      open={open}
      onClose={onClose}
      title={labels.orders}
      ariaLabel={labels.orders}
      placement="center"
      showBackButton
      warmPanel
      headerEndAction={headerEndAction}
    >
      {previewOnly ? <OrdersPreviewBanner /> : null}
      <div className={ordersModalListClassName}>
        {searchField}
        <DashboardOrdersList
          orders={filteredOrders}
          onStatusChange={onStatusChange}
          onCustomerClick={onCustomerClick}
          emptyMessage={
            hasSearchQuery ? labels.noOrderSearchResults : labels.noActiveOrders
          }
          emptyCompact
        />
      </div>
    </DashboardActionSheet>
  );
}

function OrdersHistorySheet({
  open,
  onClose,
  historyOrders,
  onCustomerClick,
}: {
  open: boolean;
  onClose: () => void;
  historyOrders: DashboardOrderView[];
  onCustomerClick: ReturnType<typeof useDashboardCustomerProfile>["openCustomer"];
}) {
  const { labels } = useAppLocale();
  const { headerEndAction, searchField, searchQuery, searchDate, hasSearchQuery } =
    useOrdersSheetSearch(open);
  const filteredOrders = useMemo(
    () => filterOrdersBySearch(historyOrders, searchQuery, searchDate),
    [historyOrders, searchQuery, searchDate]
  );

  return (
    <DashboardActionSheet
      open={open}
      onClose={onClose}
      title={labels.orderHistory}
      ariaLabel={labels.orderHistory}
      placement="center"
      showBackButton
      warmPanel
      headerEndAction={headerEndAction}
    >
      <div className={ordersModalListClassName}>
        {searchField}
        <DashboardOrdersList
          orders={filteredOrders}
          onCustomerClick={onCustomerClick}
          emptyMessage={
            hasSearchQuery
              ? labels.noOrderSearchResults
              : labels.noOrderHistory
          }
          emptyCompact
          showPrices
        />
      </div>
    </DashboardActionSheet>
  );
}

/** שורה בחנות — פותחת ישר את חלון ההזמנות הפעילות */
export function DashboardOrdersEntry({
  previewOnly = false,
  previewOrders,
}: {
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
}) {
  const [open, setOpen] = useState(false);
  const {
    labels,
    activeOrders,
    setStatus,
    openCustomer,
    customerModal,
    previewOnly: isPreview,
  } = useOrdersManager({ previewOnly, previewOrders });

  const title =
    activeOrders.length > 0
      ? `${labels.orders} (${activeOrders.length})`
      : labels.orders;

  return (
    <>
      <DashboardActionRowButton
        onClick={() => setOpen(true)}
        icon={ClipboardList}
        title={title}
      />
      <OrdersActiveSheet
        open={open}
        onClose={() => setOpen(false)}
        activeOrders={activeOrders}
        onStatusChange={setStatus}
        onCustomerClick={openCustomer}
        previewOnly={isPreview}
      />
      {customerModal}
    </>
  );
}

export function OrdersManager({
  framed = true,
  autoOpenActive = false,
  previewOnly = false,
  previewOrders,
}: {
  /** מסגרת לבנה כמו דף פעולות */
  framed?: boolean;
  /** פותח ישר את חלון ההזמנות (לינקים ישירים לעמוד) */
  autoOpenActive?: boolean;
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
}) {
  const [activeOrdersOpen, setActiveOrdersOpen] = useState(autoOpenActive);
  const [historyOrdersOpen, setHistoryOrdersOpen] = useState(false);
  const {
    labels,
    activeOrders,
    historyOrders,
    setStatus,
    openCustomer,
    customerModal,
    previewOnly: isPreview,
  } = useOrdersManager({ previewOnly, previewOrders });

  const panels = (
    <OrdersPanels
      orders={[...activeOrders, ...historyOrders]}
      onStatusChange={setStatus}
      onCustomerClick={openCustomer}
      customerModal={customerModal}
    />
  );

  if (!framed) {
    return <div className="space-y-4 text-center">{panels}</div>;
  }

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} gap-2`}>
      {isPreview && !autoOpenActive ? <OrdersPreviewBanner /> : null}

      {!autoOpenActive ? (
        <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
          <button
            type="button"
            onClick={() => {
              setHistoryOrdersOpen(false);
              setActiveOrdersOpen(true);
            }}
            className="dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition"
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
          </button>
        </div>
      ) : null}

      <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
        <button
          type="button"
          onClick={() => {
            setActiveOrdersOpen(false);
            setHistoryOrdersOpen(true);
          }}
          className="dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition"
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
        </button>
      </div>

      <OrdersActiveSheet
        open={activeOrdersOpen}
        onClose={() => setActiveOrdersOpen(false)}
        activeOrders={activeOrders}
        onStatusChange={setStatus}
        onCustomerClick={openCustomer}
        previewOnly={isPreview}
      />

      <OrdersHistorySheet
        open={historyOrdersOpen}
        onClose={() => setHistoryOrdersOpen(false)}
        historyOrders={historyOrders}
        onCustomerClick={openCustomer}
      />

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
  activeOnly = false,
  sheetHistoryOnly = false,
  sheetActiveOnly = false,
}: {
  framed?: boolean;
  previewOnly?: boolean;
  initialAppointments?: DashboardAppointmentView[];
  initialBookingByDay?: boolean;
  historyOnly?: boolean;
  activeOnly?: boolean;
  /** History list body for an action sheet — no page chrome. */
  sheetHistoryOnly?: boolean;
  /** Active appointments list for an action sheet — no page chrome. */
  sheetActiveOnly?: boolean;
} = {}) {
  const { labels } = useAppLocale();
  const [items, setItems] = useState(initialAppointments);
  const [bookingByDay, setBookingByDay] = useState(initialBookingByDay);
  const [activeModalOpen, setActiveModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
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

  if (sheetHistoryOnly) {
    return (
      <>
        <div className={appointmentsModalListClassName}>
          <AppointmentsList
            appointments={history}
            emptyMessage={labels.noAppointmentHistory}
            onCustomerClick={openCustomer}
            bookingByDay={bookingByDay}
          />
        </div>
        {customerModal}
      </>
    );
  }

  if (sheetActiveOnly) {
    return (
      <>
        <div className={appointmentsModalListClassName}>
          <AppointmentsList
            appointments={active}
            emptyMessage={labels.noActiveAppointments}
            onHide={hideAppointment}
            onCustomerClick={openCustomer}
            bookingByDay={bookingByDay}
          />
        </div>
        {customerModal}
      </>
    );
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

  if (activeOnly) {
    return (
      <div className={`${DASHBOARD_PAGE_ROOT} gap-2`}>
        {previewOnly && (
          <p className="shrink-0 rounded-[14px] border border-amber-300/50 bg-amber-50/90 px-3 py-2 text-center text-[13px] font-bold text-amber-950">
            תצוגה מקדימה — התורים הם דמו לבדיקה, השינויים לא נשמרים בשרת
          </p>
        )}
        <div className="dashboard-card bakery-float-panel min-h-0 shrink-0 rounded-[32px] p-3">
          <h2 className="pb-2 text-center text-[17px] font-extrabold text-bakery-ink">
            {labels.activeAppointments}
            {active.length > 0 && (
              <span className="font-semibold text-bakery-muted">
                {" "}
                ({active.length})
              </span>
            )}
          </h2>
          <div
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
          onClick={() => setActiveModalOpen(true)}
          className="dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition"
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
        </button>
      </div>

      <div className="dashboard-card bakery-float-panel mt-auto min-h-0 shrink-0 rounded-[32px] p-3">
        <button
          type="button"
          onClick={() => setHistoryModalOpen(true)}
          className="dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition"
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
        </button>
      </div>

      <DashboardActionSheet
        open={activeModalOpen}
        onClose={() => setActiveModalOpen(false)}
        title={
          active.length > 0
            ? `${labels.activeAppointments} (${active.length})`
            : labels.activeAppointments
        }
        ariaLabel={labels.activeAppointments}
        placement="center"
        showBackButton
      >
        <div className={appointmentsModalListClassName}>
          <AppointmentsList
            appointments={active}
            emptyMessage={labels.noActiveAppointments}
            onHide={hideAppointment}
            onCustomerClick={openCustomer}
            bookingByDay={bookingByDay}
          />
        </div>
      </DashboardActionSheet>

      <DashboardActionSheet
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={
          history.length > 0
            ? `${labels.appointmentHistory} (${history.length})`
            : labels.appointmentHistory
        }
        ariaLabel={labels.appointmentHistory}
        placement="center"
        showBackButton
      >
        <div className={appointmentsModalListClassName}>
          <AppointmentsList
            appointments={history}
            emptyMessage={labels.noAppointmentHistory}
            onCustomerClick={openCustomer}
            bookingByDay={bookingByDay}
          />
        </div>
      </DashboardActionSheet>

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
