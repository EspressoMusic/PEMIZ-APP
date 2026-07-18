"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, ClipboardList, Download, History, Search, Trash2, X } from "lucide-react";
import {
  Alert,
  Button,
  Input,
  Panel,
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
import { DashboardOrdersCalendarCard } from "@/components/dashboard/dashboard-orders-calendar";
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
    REJECTED: labels.rejected,
  };
  return map[status] ?? status;
}

/** הזמנות נשארות בחלון "הזמנות" (ולא נמחקות) עד שהמוכר מסיר אותן ידנית — אז הן עוברות להיסטוריה. */
function isOrderHidden(order: DashboardOrderView) {
  return !!order.sellerHiddenAt;
}

/** לא-הושלמו למעלה, הושלמו למטה; בתוך כל קבוצה — החדשות קודם. */
function sortOrdersForOrdersWindow(
  orders: DashboardOrderView[]
): DashboardOrderView[] {
  return [...orders].sort((a, b) => {
    const aDone = a.status === "COMPLETED";
    const bDone = b.status === "COMPLETED";
    if (aDone !== bDone) return aDone ? 1 : -1;
    return (
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    );
  });
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

type OrderStatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "REJECTED" | "COMPLETED";

function matchesOrderStatusFilter(
  order: DashboardOrderView,
  filter: OrderStatusFilter
): boolean {
  if (filter === "ALL") return true;
  return order.status === filter;
}

function OrderStatusFilterChips({
  orders,
  value,
  onChange,
}: {
  orders: DashboardOrderView[];
  value: OrderStatusFilter;
  onChange: (next: OrderStatusFilter) => void;
}) {
  const { labels } = useAppLocale();
  const options: { key: OrderStatusFilter; label: string }[] = [
    { key: "ALL", label: labels.orderStatusFilterAll },
    { key: "PENDING", label: labels.pending },
    { key: "CONFIRMED", label: labels.confirmed },
    { key: "REJECTED", label: labels.rejected },
    { key: "COMPLETED", label: labels.completed },
  ];

  return (
    <div
      className="mb-2 flex flex-wrap items-center gap-1.5 px-0.5"
      role="group"
      aria-label={labels.filterOrdersByStatus}
    >
      {options.map((opt) => {
        const count =
          opt.key === "ALL"
            ? orders.length
            : orders.filter((o) => o.status === opt.key).length;
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            aria-pressed={active}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-extrabold transition ${
              active
                ? "border-bakery-primary bg-bakery-primary text-bakery-on-primary"
                : "border-bakery-border/40 bg-bakery-card text-bakery-ink hover:bg-bakery-cream-light/80"
            }`}
          >
            {opt.label}
            {count > 0 ? ` (${count})` : ""}
          </button>
        );
      })}
    </div>
  );
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

export function mapOrdersFromApi(
  locale: AppLocale,
  raw: {
    id: string;
    orderNumber?: number;
    customerName: string;
    customerPhone: string;
    status: string;
    createdAt: string;
    customerAddress?: string | null;
    customerAddressLat?: number | null;
    customerAddressLng?: number | null;
    sellerHiddenAt?: string | null;
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
      customerAddress: o.customerAddress,
      customerAddressLat: o.customerAddressLat,
      customerAddressLng: o.customerAddressLng,
      sellerHiddenAt: o.sellerHiddenAt,
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

type ExportRange = "today" | "week" | "month" | "custom";

function exportCsvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function exportStartOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function exportEndOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function exportStartOfWeek(d: Date): Date {
  const x = exportStartOfDay(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

function exportStartOfMonth(d: Date): Date {
  const x = exportStartOfDay(d);
  x.setDate(1);
  return x;
}

function ordersInExportRange(
  orders: DashboardOrderView[],
  range: ExportRange,
  fromDate: string,
  toDate: string
): DashboardOrderView[] {
  const now = new Date();
  let since: Date;
  let until: Date;
  if (range === "today") {
    since = exportStartOfDay(now);
    until = now;
  } else if (range === "week") {
    since = exportStartOfWeek(now);
    until = now;
  } else if (range === "month") {
    since = exportStartOfMonth(now);
    until = now;
  } else {
    if (!fromDate || !toDate) return [];
    since = exportStartOfDay(new Date(`${fromDate}T00:00:00`));
    until = exportEndOfDay(new Date(`${toDate}T00:00:00`));
  }
  return orders.filter((o) => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    return d >= since && d <= until;
  });
}

/** Mirrors the columns from /api/dashboard/orders/export for the preview/demo dashboard (no email/coupon data client-side). */
function buildPreviewOrdersCsv(orders: DashboardOrderView[]): string {
  const header = [
    "מספר הזמנה",
    "תאריך",
    "שעה",
    "שם לקוח",
    "טלפון",
    "מוצר",
    "כמות",
    "מחיר ליחידה",
    'סה"כ שורה',
    'סה"כ הזמנה',
    "סטטוס",
  ];
  const rows = [header.map(exportCsvCell).join(",")];
  for (const order of orders) {
    const date = order.createdAt ? new Date(order.createdAt) : new Date();
    const dateStr = date.toLocaleDateString("he-IL");
    const timeStr = date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const orderTotal = order.items.reduce((s, it) => s + it.lineTotal, 0);
    const baseCells = [
      String(order.orderNumber ?? ""),
      dateStr,
      timeStr,
      order.customerName,
      order.customerPhone,
    ];
    if (order.items.length === 0) {
      rows.push(
        [...baseCells, "", "", "", orderTotal.toFixed(2), order.statusLabel]
          .map(exportCsvCell)
          .join(",")
      );
      continue;
    }
    for (const item of order.items) {
      rows.push(
        [
          ...baseCells,
          item.name,
          String(item.quantity),
          (item.lineTotal / item.quantity).toFixed(2),
          item.lineTotal.toFixed(2),
          orderTotal.toFixed(2),
          order.statusLabel,
        ]
          .map(exportCsvCell)
          .join(",")
      );
    }
  }
  return "﻿" + rows.join("\r\n");
}

function downloadCsvBlob(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function DashboardOrdersExportSheet({
  open,
  onClose,
  previewOnly = false,
  previewOrders = [],
}: {
  open: boolean;
  onClose: () => void;
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
}) {
  const { labels } = useAppLocale();
  const [range, setRange] = useState<ExportRange>("today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setRange("today");
      setFromDate("");
      setToDate("");
      setError("");
    }
  }, [open]);

  const rangeOptions: { id: ExportRange; label: string }[] = [
    { id: "today", label: labels.exportRangeToday },
    { id: "week", label: labels.exportRangeWeek },
    { id: "month", label: labels.exportRangeMonth },
    { id: "custom", label: labels.exportRangeCustom },
  ];

  function handleDownload() {
    if (range === "custom" && (!fromDate || !toDate)) {
      setError(labels.exportRangeMissingDates);
      return;
    }
    setError("");

    if (previewOnly) {
      const filtered = ordersInExportRange(previewOrders, range, fromDate, toDate);
      downloadCsvBlob(buildPreviewOrdersCsv(filtered), `orders-${range}.csv`);
      onClose();
      return;
    }

    const params = new URLSearchParams({ range });
    if (range === "custom") {
      params.set("from", fromDate);
      params.set("to", toDate);
    }
    window.location.href = `/api/dashboard/orders/export?${params.toString()}`;
    onClose();
  }

  return (
    <DashboardActionSheet
      open={open}
      onClose={onClose}
      title={labels.exportOrdersButton}
      ariaLabel={labels.exportOrdersButton}
      placement="center"
      showBackButton
      compact
      fitContent
    >
      <div className="space-y-3 pb-1 pt-1 text-center">
        <p className="text-[13px] font-bold text-bakery-muted">
          {labels.exportOrdersRangeTitle}
        </p>

        <div className="grid grid-cols-2 gap-2">
          {rangeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRange(opt.id)}
              className={`rounded-[14px] px-3 py-2.5 text-[14px] font-extrabold transition ${
                range === opt.id
                  ? "bg-bakery-primary/15 text-bakery-primary ring-2 ring-bakery-primary/30"
                  : "border border-bakery-border/35 bg-bakery-input/80 text-bakery-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {range === "custom" ? (
          <div className="grid grid-cols-2 gap-2 text-start">
            <div>
              <label className="mb-1 block text-[12px] font-bold text-bakery-muted">
                {labels.exportRangeFrom}
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="rounded-[12px]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-bold text-bakery-muted">
                {labels.exportRangeTo}
              </label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="rounded-[12px]"
              />
            </div>
          </div>
        ) : null}

        {error ? <Alert variant="error">{error}</Alert> : null}

        <Button
          variant="primary"
          className="w-full min-h-[46px] font-extrabold"
          onClick={handleDownload}
        >
          <span className="inline-flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            {labels.exportRangeDownload}
          </span>
        </Button>
      </div>
    </DashboardActionSheet>
  );
}

function DashboardOrdersExportButton({
  previewOnly,
  previewOrders,
}: {
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
}) {
  const { labels } = useAppLocale();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-bakery-ink transition hover:bg-bakery-cream-light/80 active:opacity-80"
        aria-label={labels.exportOrdersButton}
        title={labels.exportOrdersButton}
      >
        <Download className="h-5 w-5" strokeWidth={2.5} />
      </button>
      <DashboardOrdersExportSheet
        open={open}
        onClose={() => setOpen(false)}
        previewOnly={previewOnly}
        previewOrders={previewOrders}
      />
    </>
  );
}

function DashboardOrdersCalendarButton({
  previewOnly,
  previewOrders,
}: {
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
}) {
  const { labels } = useAppLocale();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-bakery-ink transition hover:bg-bakery-cream-light/80 active:opacity-80"
        aria-label={labels.ordersCalendarTitle}
        title={labels.ordersCalendarTitle}
      >
        <Calendar className="h-5 w-5" strokeWidth={2.5} />
      </button>
      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel={labels.ordersCalendarTitle}
        placement="center"
        showBackButton
        compact
        fitContent
        panelClassName="dashboard-orders-calendar-sheet"
      >
        <DashboardOrdersCalendarCard
          embedded
          previewOnly={previewOnly}
          previewOrders={previewOrders}
        />
      </DashboardActionSheet>
    </>
  );
}

function DashboardOrdersDeleteMenuButton({
  orders,
  onHideOrders,
}: {
  orders: DashboardOrderView[];
  onHideOrders?: (orderIds: string[]) => void | Promise<void>;
}) {
  const { labels } = useAppLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingTarget, setPendingTarget] = useState<"all" | "completed" | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!onHideOrders || orders.length === 0) return null;

  const completedOrders = orders.filter((o) => o.status === "COMPLETED");

  function chooseTarget(target: "all" | "completed") {
    setMenuOpen(false);
    setPendingTarget(target);
  }

  async function confirmDelete() {
    const ids =
      pendingTarget === "all"
        ? orders.map((o) => o.id)
        : completedOrders.map((o) => o.id);
    setDeleting(true);
    await onHideOrders?.(ids);
    setDeleting(false);
    setPendingTarget(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-bakery-ink transition hover:bg-bakery-cream-light/80 active:opacity-80"
        aria-label={labels.deleteOrdersButtonLabel}
        title={labels.deleteOrdersButtonLabel}
      >
        <Trash2 className="h-5 w-5" strokeWidth={2.5} />
      </button>

      <DashboardActionSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        ariaLabel={labels.deleteOrdersButtonLabel}
        placement="center"
        showBackButton
        backButtonOutside
        compact
        fitContent
      >
        <div className="space-y-2 px-1 py-1">
          <button
            type="button"
            onClick={() => chooseTarget("all")}
            className="w-full rounded-[14px] border-2 border-bakery-primary bg-bakery-primary px-4 py-3 text-center text-[15px] font-extrabold text-bakery-on-primary transition hover:opacity-95 active:opacity-80"
          >
            {labels.deleteAllOrders}
          </button>
          <button
            type="button"
            disabled={completedOrders.length === 0}
            onClick={() => chooseTarget("completed")}
            className="w-full rounded-[14px] border-2 border-bakery-primary bg-bakery-primary px-4 py-3 text-center text-[15px] font-extrabold text-bakery-on-primary transition hover:opacity-95 active:opacity-80 disabled:opacity-40"
          >
            {labels.deleteCompletedOrders}
          </button>
        </div>
      </DashboardActionSheet>

      <DashboardActionSheet
        open={pendingTarget !== null}
        onClose={() => !deleting && setPendingTarget(null)}
        title={labels.deleteOrdersModalTitle}
        ariaLabel={labels.deleteOrdersModalTitle}
        placement="center"
        expanded={false}
        fitContent
        panelClassName="w-full max-w-md"
      >
        <div className="space-y-6 px-2 py-2 text-center">
          <p className="text-[15px] font-semibold leading-relaxed text-bakery-ink">
            {labels.deleteOrdersModalBody}
          </p>
          <div className="flex flex-row items-stretch justify-center gap-3">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setPendingTarget(null)}
              className="min-h-[48px] min-w-[7.5rem] rounded-xl border-2 border-bakery-border bg-bakery-card px-4 text-[15px] font-extrabold text-bakery-ink transition hover:bg-bakery-surface active:opacity-80 disabled:opacity-50"
            >
              {labels.cancel}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void confirmDelete()}
              className="min-h-[48px] min-w-[7.5rem] rounded-xl border-2 border-bakery-error/45 bg-bakery-card px-4 text-[15px] font-extrabold text-bakery-error transition hover:bg-bakery-error/10 active:opacity-80 disabled:opacity-50"
            >
              {deleting ? labels.deleting : labels.deleteOrdersModalConfirm}
            </button>
          </div>
        </div>
      </DashboardActionSheet>
    </>
  );
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

    // New orders arrive via push notification, not a live connection to this
    // tab — poll while visible and refetch immediately when the seller
    // returns to the tab (e.g. after tapping the notification) so the order
    // shows up without a manual reload.
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 15000);
    function handleVisible() {
      if (document.visibilityState === "visible") void load();
    }
    document.addEventListener("visibilitychange", handleVisible);
    window.addEventListener("focus", handleVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisible);
      window.removeEventListener("focus", handleVisible);
    };
  }, [locale, previewOnly, previewOrders]);

  const activeOrders = sortOrdersForOrdersWindow(
    orders.filter((o) => !isOrderHidden(o))
  );
  const historyOrders = orders.filter(isOrderHidden);
  const unfinishedOrdersCount = activeOrders.filter(
    (o) => o.status !== "COMPLETED"
  ).length;
  const { openCustomer, modal: customerModal } = useDashboardCustomerProfile({
    previewOnly,
    previewOrders: orders,
  });

  async function confirmOrder(orderId: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "CONFIRMED", statusLabel: orderStatusLabel("CONFIRMED", locale) }
          : o
      )
    );
    if (previewOnly) return;
    await fetch("/api/dashboard/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: "CONFIRMED" }),
    });
  }

  async function rejectOrder(orderId: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "REJECTED", statusLabel: orderStatusLabel("REJECTED", locale) }
          : o
      )
    );
    if (previewOnly) return;
    await fetch("/api/dashboard/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: "REJECTED" }),
    });
  }

  async function toggleOrderCompletion(orderId: string) {
    const current = orders.find((o) => o.id === orderId);
    if (!current) return;
    const nextStatus = current.status === "COMPLETED" ? "CONFIRMED" : "COMPLETED";
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: nextStatus, statusLabel: orderStatusLabel(nextStatus, locale) }
          : o
      )
    );
    if (previewOnly) return;
    await fetch("/api/dashboard/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: nextStatus }),
    });
  }

  async function hideOrders(orderIds: string[]) {
    const hiddenAt = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) =>
        orderIds.includes(o.id) ? { ...o, sellerHiddenAt: hiddenAt } : o
      )
    );
    if (previewOnly) return;
    await fetch("/api/dashboard/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderIds, hide: true }),
    });
  }

  return {
    labels,
    activeOrders,
    historyOrders,
    unfinishedOrdersCount,
    openCustomer,
    customerModal,
    confirmOrder,
    rejectOrder,
    toggleOrderCompletion,
    hideOrders,
    previewOnly,
  };
}

function OrdersPanels({
  activeOrders,
  historyOrders,
  onCustomerClick,
  onConfirmOrder,
  onRejectOrder,
  onToggleComplete,
  onHideOrders,
  customerModal,
}: {
  activeOrders: DashboardOrderView[];
  historyOrders: DashboardOrderView[];
  onCustomerClick?: ReturnType<
    typeof useDashboardCustomerProfile
  >["openCustomer"];
  onConfirmOrder?: (orderId: string) => void;
  onRejectOrder?: (orderId: string) => void;
  onToggleComplete?: (orderId: string) => void;
  onHideOrders?: (orderIds: string[]) => void | Promise<void>;
  customerModal?: React.ReactNode;
}) {
  const { labels } = useAppLocale();

  return (
    <div className="space-y-5 pb-2">
      <DashboardOrdersSection
        title={labels.activeOrders}
        orders={activeOrders}
        onCustomerClick={onCustomerClick}
        onConfirmOrder={onConfirmOrder}
        onRejectOrder={onRejectOrder}
        onToggleComplete={onToggleComplete}
        onHideOrders={onHideOrders}
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
  onCustomerClick,
  onConfirmOrder,
  onRejectOrder,
  onToggleComplete,
  onHideOrders,
  previewOnly,
  allOrdersForExport,
}: {
  open: boolean;
  onClose: () => void;
  activeOrders: DashboardOrderView[];
  onCustomerClick: ReturnType<typeof useDashboardCustomerProfile>["openCustomer"];
  onConfirmOrder?: (orderId: string) => void;
  onRejectOrder?: (orderId: string) => void;
  onToggleComplete?: (orderId: string) => void;
  onHideOrders?: (orderIds: string[]) => void | Promise<void>;
  previewOnly?: boolean;
  allOrdersForExport?: DashboardOrderView[];
}) {
  const { labels } = useAppLocale();
  const { headerEndAction, searchField, searchQuery, searchDate, hasSearchQuery } =
    useOrdersSheetSearch(open);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("ALL");
  useEffect(() => {
    if (!open) setStatusFilter("ALL");
  }, [open]);
  const filteredOrders = useMemo(
    () =>
      filterOrdersBySearch(activeOrders, searchQuery, searchDate).filter((o) =>
        matchesOrderStatusFilter(o, statusFilter)
      ),
    [activeOrders, searchQuery, searchDate, statusFilter]
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
      headerEndAction={
        <div className="flex items-center gap-1">
          <DashboardOrdersCalendarButton
            previewOnly={previewOnly}
            previewOrders={allOrdersForExport ?? activeOrders}
          />
          <DashboardOrdersExportButton
            previewOnly={previewOnly}
            previewOrders={allOrdersForExport ?? activeOrders}
          />
          <DashboardOrdersDeleteMenuButton
            orders={activeOrders}
            onHideOrders={onHideOrders}
          />
          {headerEndAction}
        </div>
      }
    >
      {previewOnly ? <OrdersPreviewBanner /> : null}
      <div className={ordersModalListClassName}>
        {searchField}
        <OrderStatusFilterChips
          orders={activeOrders}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <DashboardOrdersList
          orders={filteredOrders}
          onCustomerClick={onCustomerClick}
          onConfirmOrder={onConfirmOrder}
          onRejectOrder={onRejectOrder}
          onToggleComplete={onToggleComplete}
          onHideOrders={onHideOrders}
          emptyMessage={
            hasSearchQuery || statusFilter !== "ALL"
              ? labels.noOrderSearchResults
              : labels.noActiveOrders
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
  previewOnly,
  allOrdersForExport,
}: {
  open: boolean;
  onClose: () => void;
  historyOrders: DashboardOrderView[];
  onCustomerClick: ReturnType<typeof useDashboardCustomerProfile>["openCustomer"];
  previewOnly?: boolean;
  allOrdersForExport?: DashboardOrderView[];
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
      headerEndAction={
        <div className="flex items-center gap-1">
          <DashboardOrdersCalendarButton
            previewOnly={previewOnly}
            previewOrders={allOrdersForExport ?? historyOrders}
          />
          <DashboardOrdersExportButton
            previewOnly={previewOnly}
            previewOrders={allOrdersForExport ?? historyOrders}
          />
          {headerEndAction}
        </div>
      }
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
    historyOrders,
    unfinishedOrdersCount,
    openCustomer,
    customerModal,
    confirmOrder,
    rejectOrder,
    toggleOrderCompletion,
    hideOrders,
    previewOnly: isPreview,
  } = useOrdersManager({ previewOnly, previewOrders });

  const title =
    unfinishedOrdersCount > 0
      ? `${labels.orders} (${unfinishedOrdersCount})`
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
        onCustomerClick={openCustomer}
        onConfirmOrder={confirmOrder}
        onRejectOrder={rejectOrder}
        onToggleComplete={toggleOrderCompletion}
        onHideOrders={hideOrders}
        previewOnly={isPreview}
        allOrdersForExport={[...activeOrders, ...historyOrders]}
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
    unfinishedOrdersCount,
    openCustomer,
    customerModal,
    confirmOrder,
    rejectOrder,
    toggleOrderCompletion,
    hideOrders,
    previewOnly: isPreview,
  } = useOrdersManager({ previewOnly, previewOrders });

  const panels = (
    <OrdersPanels
      activeOrders={activeOrders}
      historyOrders={historyOrders}
      onCustomerClick={openCustomer}
      onConfirmOrder={confirmOrder}
      onRejectOrder={rejectOrder}
      onToggleComplete={toggleOrderCompletion}
      onHideOrders={hideOrders}
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
              {unfinishedOrdersCount > 0 && (
                <span className="font-semibold text-bakery-muted">
                  {" "}
                  ({unfinishedOrdersCount})
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
        onCustomerClick={openCustomer}
        onConfirmOrder={confirmOrder}
        onRejectOrder={rejectOrder}
        onToggleComplete={toggleOrderCompletion}
        onHideOrders={hideOrders}
        previewOnly={isPreview}
        allOrdersForExport={[...activeOrders, ...historyOrders]}
      />

      <OrdersHistorySheet
        open={historyOrdersOpen}
        onClose={() => setHistoryOrdersOpen(false)}
        historyOrders={historyOrders}
        onCustomerClick={openCustomer}
        previewOnly={isPreview}
        allOrdersForExport={[...activeOrders, ...historyOrders]}
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
