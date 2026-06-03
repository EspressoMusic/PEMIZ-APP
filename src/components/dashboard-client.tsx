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

export function ProductsManager() {
  const [products, setProducts] = useState<
    {
      id: string;
      name: string;
      price: number;
      description?: string | null;
      isActive: boolean;
    }[]
  >([]);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/dashboard/products");
    const data = await res.json();
    if (res.ok) setProducts(data.products);
  }

  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/dashboard/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        description: fd.get("description") || undefined,
        price: Number(fd.get("price")),
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      setError(d.error);
      return;
    }
    e.currentTarget.reset();
    load();
  }

  async function toggle(id: string, isActive: boolean) {
    await fetch(`/api/dashboard/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    load();
  }

  return (
    <div className="space-y-5">
      <PageTitle subtitle="הוסף מוצרים שיוצגו בעמוד הלקוחות">מוצרים</PageTitle>
      {error && <Alert variant="error">{error}</Alert>}
      <Panel>
        <h2 className="text-[18px] font-bold">הוספת מוצר</h2>
        <form onSubmit={add} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input name="name" label="שם" required />
          <Input
            name="price"
            label="מחיר (₪)"
            type="number"
            step="0.01"
            required
            dir="ltr"
          />
          <Input name="description" label="תיאור" className="sm:col-span-2" />
          <Button type="submit" variant="square">
            הוסף
          </Button>
        </form>
      </Panel>
      <div className="grid grid-cols-2 gap-2.5">
        {products.map((p) => (
          <SquareCard key={p.id} className="p-3">
            <p className="truncate text-[17px] font-extrabold">{p.name}</p>
            <p className="text-[16px] font-extrabold text-bakery-ink">
              ₪{p.price.toFixed(2)}
            </p>
            <div className="mt-2 flex items-center justify-between gap-1">
              <Badge tone={p.isActive ? "success" : "default"}>
                {p.isActive ? "פעיל" : "מוסתר"}
              </Badge>
              <Button
                variant="ghost"
                onClick={() => toggle(p.id, p.isActive)}
              >
                {p.isActive ? "הסתר" : "הצג"}
              </Button>
            </div>
          </SquareCard>
        ))}
      </div>
    </div>
  );
}

export function OrdersManager() {
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
      <PageTitle>הזמנות</PageTitle>
      {orders.map((o) => (
        <Panel key={o.id}>
          <div className="flex flex-wrap justify-between gap-2">
            <div>
              <p className="text-[17px] font-extrabold">{o.customerName}</p>
              <p className="text-[14px]" dir="ltr">
                {o.customerPhone}
              </p>
            </div>
            <Badge>{o.status}</Badge>
          </div>
          <ul className="mt-3 text-[15px] leading-[1.45] text-bakery-muted">
            {o.items.map((it, i) => (
              <li key={i}>
                {it.product.name} × {it.quantity} — ₪
                {(it.priceAtOrder * it.quantity).toFixed(2)}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            {["CONFIRMED", "COMPLETED", "CANCELLED"].map((s) => (
              <Button
                key={s}
                variant="secondary"
                onClick={() => setStatus(o.id, s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </Panel>
      ))}
      {orders.length === 0 && (
        <p className="text-bakery-muted">אין הזמנות עדיין.</p>
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

export function InquiriesManager() {
  const [items, setItems] = useState<
    {
      id: string;
      customerName: string;
      message: string;
      customerPhone?: string | null;
      createdAt: string;
    }[]
  >([]);

  useEffect(() => {
    fetch("/api/dashboard/inquiries")
      .then((r) => r.json())
      .then((d) => setItems(d.inquiries ?? []));
  }, []);

  return (
    <div className="space-y-4">
      <PageTitle>פניות מלקוחות</PageTitle>
      {items.map((q) => (
        <Panel key={q.id}>
          <p className="text-[17px] font-extrabold">{q.customerName}</p>
          {q.customerPhone && (
            <p className="text-[14px]" dir="ltr">
              {q.customerPhone}
            </p>
          )}
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-[1.45] text-bakery-ink">
            {q.message}
          </p>
          <p className="mt-2 text-[12px] text-bakery-muted">
            {new Date(q.createdAt).toLocaleString("he-IL")}
          </p>
        </Panel>
      ))}
      {items.length === 0 && <p className="text-bakery-muted">אין פניות.</p>}
    </div>
  );
}

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
