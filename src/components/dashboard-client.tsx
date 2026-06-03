"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Panel,
  Badge,
  PageTitle,
} from "@/components/ui";
import {
  DashboardOrdersSection,
  type DashboardOrderView,
} from "@/components/dashboard/dashboard-order-card";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { getDashboardLabels, type AppLocale } from "@/lib/app-locale";
import {
  DashboardPanelFrame,
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";
export { ProductsManager } from "@/components/dashboard/products-manager";

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

const ACTIVE_ORDER_STATUSES = new Set(["PENDING", "CONFIRMED"]);

function isActiveOrderStatus(status: string) {
  return ACTIVE_ORDER_STATUSES.has(status);
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
  return raw.map((o) => ({
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
  }));
}

function OrdersPanels({
  orders,
  onStatusChange,
}: {
  orders: DashboardOrderView[];
  onStatusChange?: (orderId: string, status: string) => void;
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
        emptyMessage={labels.noActiveOrders}
      />
      <DashboardOrdersSection
        title={labels.orderHistory}
        orders={historyOrders}
        emptyMessage={labels.noOrderHistory}
      />
    </div>
  );
}

export function OrdersManager({
  framed = true,
  previewOrders,
}: {
  /** מסגרת לבנה כמו דף פעולות */
  framed?: boolean;
  previewOrders?: DashboardOrderView[];
}) {
  const [orders, setOrders] = useState<DashboardOrderView[]>(previewOrders ?? []);
  const { locale } = useAppLocale();

  async function load() {
    if (previewOrders) return;
    const res = await fetch("/api/dashboard/orders");
    const data = await res.json();
    if (!res.ok) return;
    const mapped = mapOrdersFromApi(locale, data.orders ?? []);
    setOrders(mapped);
  }

  useEffect(() => {
    if (previewOrders) {
      setOrders(
        previewOrders.map((o) => ({
          ...o,
          statusLabel: orderStatusLabel(o.status, locale),
        }))
      );
      return;
    }
    void load();
  }, [locale, previewOrders]);

  async function setStatus(orderId: string, status: string) {
    if (previewOrders) return;
    await fetch("/api/dashboard/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    load();
  }

  const panels = (
    <OrdersPanels
      orders={orders}
      onStatusChange={previewOrders ? undefined : setStatus}
    />
  );

  if (!framed) {
    return <div className="space-y-4 text-center">{panels}</div>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DashboardPanelFrame className="flex min-h-0 flex-1 flex-col overflow-hidden text-center">
        <div className={DASHBOARD_SCROLL_MAIN}>{panels}</div>
      </DashboardPanelFrame>
    </div>
  );
}

export function SlotsManager() {
  const { labels, formatDateTime } = useAppLocale();
  const [slots, setSlots] = useState<
    {
      id: string;
      startAt: string;
      endAt: string;
      maxBookings: number;
      appointments: unknown[];
    }[]
  >([]);

  async function load() {
    const res = await fetch("/api/dashboard/slots");
    const data = await res.json();
    if (res.ok) setSlots(data.slots);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

export function AppointmentsManager() {
  const { labels, formatDateTime } = useAppLocale();
  const [items, setItems] = useState<
    {
      id: string;
      customerName: string;
      customerPhone: string;
      status: string;
      slot: { startAt: string; endAt: string };
    }[]
  >([]);

  async function load() {
    const res = await fetch("/api/dashboard/appointments");
    const data = await res.json();
    if (res.ok) setItems(data.appointments);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(appointmentId: string, status: string) {
    await fetch("/api/dashboard/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId, status }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <PageTitle>{labels.orders}</PageTitle>
      {items.map((a) => (
        <Panel key={a.id}>
          <p className="text-[17px] font-extrabold">{a.customerName}</p>
          <p className="text-[14px]" dir="ltr">
            {a.customerPhone}
          </p>
          <p className="text-[14px] text-bakery-muted" dir="ltr">
            {formatDateTime(a.slot.startAt)}
          </p>
          <Badge>{a.status}</Badge>
          <div className="mt-2 flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setStatus(a.id, "CONFIRMED")}
            >
              {labels.confirmOrder}
            </Button>
            <Button variant="danger" onClick={() => setStatus(a.id, "CANCELLED")}>
              {labels.cancelOrder}
            </Button>
          </div>
        </Panel>
      ))}
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
