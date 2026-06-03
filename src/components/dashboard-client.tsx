"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Input,
  Panel,
  SquareCard,
  Badge,
  Alert,
  PageTitle,
} from "@/components/ui";
export { ProductsManager } from "@/components/dashboard/products-manager";

const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "ממתין",
  CONFIRMED: "אושר",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
};

const ORDER_STATUS_ACTIONS: { status: string; label: string }[] = [
  { status: "CONFIRMED", label: "אשר" },
  { status: "COMPLETED", label: "סמן כהושלם" },
  { status: "CANCELLED", label: "בטל" },
];

export function OrdersManager({ title = "הזמנות" }: { title?: string }) {
  const [orders, setOrders] = useState<
    {
      id: string;
      customerName: string;
      customerPhone: string;
      status: string;
      createdAt: string;
      items: {
        quantity: number;
        product: { name: string };
        priceAtOrder: number;
      }[];
    }[]
  >([]);

  async function load() {
    const res = await fetch("/api/dashboard/orders");
    const data = await res.json();
    if (res.ok) setOrders(data.orders);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(orderId: string, status: string) {
    await fetch("/api/dashboard/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <PageTitle>{title}</PageTitle>
      {orders.map((o) => {
        const total = o.items.reduce(
          (s, it) => s + it.priceAtOrder * it.quantity,
          0
        );
        const created = new Date(o.createdAt).toLocaleString("he-IL", {
          dateStyle: "short",
          timeStyle: "short",
        });
        return (
          <Panel key={o.id}>
            <div className="flex flex-wrap justify-between gap-2">
              <div className="text-start">
                <p className="text-[17px] font-extrabold">{o.customerName}</p>
                <p className="text-[14px]" dir="ltr">
                  {o.customerPhone}
                </p>
                <p className="mt-1 text-[13px] text-bakery-muted">{created}</p>
              </div>
              <Badge>
                {ORDER_STATUS_LABEL[o.status] ?? o.status}
              </Badge>
            </div>
            <ul className="mt-3 space-y-1 text-[15px] leading-[1.45] text-bakery-muted">
              {o.items.map((it, i) => (
                <li key={i}>
                  {it.product.name} × {it.quantity} —{" "}
                  {(it.priceAtOrder * it.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[15px] font-extrabold text-bakery-ink">
              סה״כ: {total.toFixed(2)}
            </p>
            {o.status !== "CANCELLED" && o.status !== "COMPLETED" && (
              <div className="mt-3 flex flex-wrap gap-2">
                {ORDER_STATUS_ACTIONS.map(({ status, label }) => (
                  <Button
                    key={status}
                    variant="secondary"
                    onClick={() => setStatus(o.id, status)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}
          </Panel>
        );
      })}
      {orders.length === 0 && (
        <p className="text-center text-bakery-muted">אין הזמנות עדיין.</p>
      )}
    </div>
  );
}

export function SlotsManager() {
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
      <PageTitle>משבצות תורים</PageTitle>
      <Panel>
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-2">
          <Input
            name="startAt"
            label="התחלה"
            type="datetime-local"
            required
            dir="ltr"
          />
          <Input
            name="endAt"
            label="סיום"
            type="datetime-local"
            required
            dir="ltr"
          />
          <Input
            name="maxBookings"
            label="מקסימום הזמנות"
            type="number"
            defaultValue={1}
            min={1}
            dir="ltr"
          />
          <Button type="submit">הוסף משבצת</Button>
        </form>
      </Panel>
      <ul className="space-y-2">
        {slots.map((s) => (
          <Panel key={s.id} className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[14px] font-medium" dir="ltr">
              {new Date(s.startAt).toLocaleString("he-IL")} —{" "}
              {new Date(s.endAt).toLocaleTimeString("he-IL")} (
              {s.appointments.length}/{s.maxBookings})
            </span>
            <Button variant="danger" onClick={() => remove(s.id)}>
              מחק
            </Button>
          </Panel>
        ))}
      </ul>
    </div>
  );
}

export function AppointmentsManager() {
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
      <PageTitle>תורים שנקבעו</PageTitle>
      {items.map((a) => (
        <Panel key={a.id}>
          <p className="text-[17px] font-extrabold">{a.customerName}</p>
          <p className="text-[14px]" dir="ltr">
            {a.customerPhone}
          </p>
          <p className="text-[14px] text-bakery-muted" dir="ltr">
            {new Date(a.slot.startAt).toLocaleString("he-IL")}
          </p>
          <Badge>{a.status}</Badge>
          <div className="mt-2 flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setStatus(a.id, "CONFIRMED")}
            >
              אשר
            </Button>
            <Button variant="danger" onClick={() => setStatus(a.id, "CANCELLED")}>
              בטל
            </Button>
          </div>
        </Panel>
      ))}
    </div>
  );
}

export { DashboardInquiriesManager as InquiriesManager } from "@/components/dashboard/dashboard-inquiries-manager";

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/";
      }}
    >
      התנתקות
    </Button>
  );
}
