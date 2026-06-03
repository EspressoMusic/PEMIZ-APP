"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Settings,
  Tag,
  Receipt,
  Store,
  Mail,
  HelpCircle,
  SlidersHorizontal,
  ShieldPlus,
  UserRound,
  Calendar,
  CalendarCheck,
} from "lucide-react";
import { UNAVAILABLE_MESSAGE } from "@/lib/constants";
import { Button, Input, Textarea } from "@/components/ui";
import { CustomerBottomBar, type NavItem } from "./customer-bottom-bar";
import {
  CustomerTabBody,
  EmptyStateCard,
  OrdersHubPanel,
  SettingsMenuRow,
  QuickActionGrid,
  ProductGridCard,
  SoftWrapPanel,
  HubEmptyText,
} from "./customer-ui";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
};

type Slot = {
  id: string;
  startAt: string;
  endAt: string;
  maxBookings: number;
  appointments: unknown[];
};

const TAB_SETTINGS = 0;
const TAB_DEALS = 1;
const TAB_ORDERS = 2;
const TAB_MENU = 3;

const LABELS = {
  settings: "Settings",
  deals: "Deals",
  orders: "Orders",
  menu: "Menu",
  contact: "Contact us",
  store: "Store",
  faq: "FAQ",
  faqSub: "Quick answers",
  language: "Language & display",
  languageSub: "English · Calm mode",
  legal: "Accessibility & legal",
  legalSub: "Text size, privacy & terms",
  signIn: "Customer sign-in",
  signInSub: "Saved on this device",
  noServices: "No services listed yet.",
  noDeals: "No active deals",
  activeOrders: "Active orders",
  cartEmpty: "Cart is empty",
  orderHistory: "Order history",
  noPastOrders: "No past orders",
  noSlots: "No appointments available.",
  noMyAppts: "No past appointments",
};

export function CustomerStoreApp({
  business,
  unavailable,
}: {
  business: {
    slug: string;
    name: string;
    description: string | null;
    type: string;
    products: Product[];
    slots: Slot[];
  };
  unavailable: boolean;
}) {
  const isAppointments = business.type === "APPOINTMENTS";
  const [tab, setTab] = useState(isAppointments ? 2 : TAB_MENU);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [orderPhone, setOrderPhone] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(`linky-customer-${business.slug}`);
    if (saved) setCustomerName(saved);
  }, [business.slug]);

  const navItems: NavItem[] = useMemo(() => {
    if (isAppointments) {
      return [
        { icon: Settings, label: LABELS.settings },
        { icon: CalendarCheck, label: "My appointments" },
        { icon: Calendar, label: "Appointments" },
      ];
    }
    return [
      { icon: Settings, label: LABELS.settings },
      { icon: Tag, label: LABELS.deals },
      { icon: Receipt, label: LABELS.orders },
      { icon: Store, label: LABELS.menu },
    ];
  }, [isAppointments]);

  const navIndex = isAppointments
    ? tab === TAB_SETTINGS
      ? 0
      : tab === 1
        ? 1
        : 2
    : tab;

  const onNavSelect = useCallback(
    (nav: number) => {
      if (isAppointments) {
        setTab(nav === 0 ? TAB_SETTINGS : nav === 1 ? 1 : 2);
      } else {
        setTab(nav);
      }
      setContactOpen(false);
    },
    [isAppointments]
  );

  const cartLines = useMemo(
    () =>
      business.products
        .filter((p) => (cart[p.id] ?? 0) > 0)
        .map((p) => ({ product: p, qty: cart[p.id] ?? 0 })),
    [business.products, cart]
  );

  const cartTotal = cartLines.reduce(
    (s, l) => s + l.product.price * l.qty,
    0
  );

  async function submitOrder() {
    if (cartLines.length === 0) return;
    const name = customerName.trim();
    const phone = orderPhone.trim();
    if (!name || !phone) {
      setTab(TAB_ORDERS);
      return;
    }
    const res = await fetch(`/api/public/${business.slug}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        customerPhone: phone,
        items: cartLines.map((l) => ({
          productId: l.product.id,
          quantity: l.qty,
        })),
      }),
    });
    if (res.ok) {
      setCart({});
      localStorage.setItem(`linky-customer-${business.slug}`, name);
    }
  }

  async function sendInquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/public/${business.slug}/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: fd.get("customerName"),
        customerPhone: fd.get("customerPhone"),
        message: fd.get("message"),
      }),
    });
    setContactOpen(false);
    e.currentTarget.reset();
  }

  async function bookSlot(e: React.FormEvent<HTMLFormElement>, slotId: string) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/public/${business.slug}/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slotId,
        customerName: fd.get("customerName"),
        customerPhone: fd.get("customerPhone"),
        notes: fd.get("notes"),
      }),
    });
  }

  const availableSlots = business.slots.filter(
    (s) =>
      s.appointments.length < s.maxBookings &&
      new Date(s.startAt) > new Date()
  );

  return (
    <div
      lang="en"
      dir="ltr"
      className="mx-auto min-h-[100dvh] max-w-[430px] bg-customer-bg pb-[76px]"
    >
      {unavailable ? (
        <CustomerTabBody>
          <div className="pt-6">
            <EmptyStateCard message={UNAVAILABLE_MESSAGE} />
          </div>
        </CustomerTabBody>
      ) : (
        <>
          {tab === TAB_SETTINGS && (
            <CustomerTabBody>
              <div className="px-4 pb-6">
                <SoftWrapPanel>
                  <QuickActionGrid
                    contactLabel={LABELS.contact}
                    storeLabel={LABELS.store}
                    contactIcon={Mail}
                    storeIcon={Store}
                    onContact={() => setContactOpen(true)}
                    onStore={() => onNavSelect(isAppointments ? 2 : TAB_MENU)}
                  />
                </SoftWrapPanel>

                <div className="mt-[22px] space-y-3">
                {contactOpen && (
                  <div className="rounded-[22px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-4 bakery-panel-shadow">
                    <form onSubmit={sendInquiry} className="space-y-2">
                      <Input name="customerName" label="Name" required />
                      <Input name="customerPhone" label="Phone" />
                      <Textarea name="message" label="Message" rows={3} required />
                      <div className="flex gap-2 pt-1">
                        <Button type="submit" className="min-h-[48px] flex-1">
                          Send
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setContactOpen(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                <SettingsMenuRow
                  icon={HelpCircle}
                  title={LABELS.faq}
                  subtitle={LABELS.faqSub}
                  onClick={() => {}}
                />

                <SettingsMenuRow
                  icon={SlidersHorizontal}
                  title={LABELS.language}
                  subtitle={LABELS.languageSub}
                />

                <SettingsMenuRow
                  icon={ShieldPlus}
                  title={LABELS.legal}
                  subtitle={LABELS.legalSub}
                  href="/privacy"
                />

                <SettingsMenuRow
                  icon={UserRound}
                  title={LABELS.signIn}
                  subtitle={LABELS.signInSub}
                  onClick={() => setProfileOpen(!profileOpen)}
                />

                {profileOpen && (
                  <div className="rounded-[22px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-4 bakery-panel-shadow">
                    <Input
                      label="Your name"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        localStorage.setItem(
                          `linky-customer-${business.slug}`,
                          e.target.value
                        );
                      }}
                    />
                  </div>
                )}
                </div>
              </div>
            </CustomerTabBody>
          )}

          {!isAppointments && tab === TAB_DEALS && (
            <CustomerTabBody>
              <EmptyStateCard message={LABELS.noDeals} />
            </CustomerTabBody>
          )}

          {!isAppointments && tab === TAB_ORDERS && (
            <CustomerTabBody>
              <div className="space-y-2.5 px-3.5">
                <OrdersHubPanel title={LABELS.activeOrders}>
                  {cartLines.length === 0 ? (
                    <HubEmptyText>{LABELS.cartEmpty}</HubEmptyText>
                  ) : (
                    <ul className="space-y-1.5 py-2 text-left text-[15px] text-bakery-ink">
                      {cartLines.map((l) => (
                        <li
                          key={l.product.id}
                          className="flex justify-between font-semibold"
                        >
                          <span>
                            {l.product.name} × {l.qty}
                          </span>
                          <span>
                            ₪{(l.product.price * l.qty).toFixed(2)}
                          </span>
                        </li>
                      ))}
                      <li className="border-t border-bakery-border/40 pt-2 font-extrabold">
                        Total: ₪{cartTotal.toFixed(2)}
                      </li>
                    </ul>
                  )}
                </OrdersHubPanel>

                <OrdersHubPanel title={LABELS.orderHistory}>
                  <HubEmptyText>{LABELS.noPastOrders}</HubEmptyText>
                </OrdersHubPanel>

                {cartLines.length > 0 && (
                  <div className="rounded-[22px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-4 bakery-panel-shadow">
                    <Input
                      label="Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <div className="mt-2">
                      <Input
                        label="Phone"
                        value={orderPhone}
                        onChange={(e) => setOrderPhone(e.target.value)}
                      />
                    </div>
                    <Button
                      className="mt-3 w-full min-h-[48px]"
                      onClick={submitOrder}
                    >
                      Confirm order
                    </Button>
                  </div>
                )}
              </div>
            </CustomerTabBody>
          )}

          {((!isAppointments && tab === TAB_MENU) ||
            (isAppointments && tab === 2)) && (
            <CustomerTabBody>
              {!isAppointments ? (
                business.products.length === 0 ? (
                  <EmptyStateCard message={LABELS.noServices} />
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 px-3 pb-4">
                    {business.products.map((p) => (
                      <ProductGridCard
                        key={p.id}
                        name={p.name}
                        description={p.description}
                        price={p.price}
                        qty={cart[p.id] ?? 0}
                        onDec={() =>
                          setCart((c) => ({
                            ...c,
                            [p.id]: Math.max(0, (c[p.id] ?? 0) - 1),
                          }))
                        }
                        onInc={() =>
                          setCart((c) => ({
                            ...c,
                            [p.id]: Math.min(20, (c[p.id] ?? 0) + 1),
                          }))
                        }
                      />
                    ))}
                  </div>
                )
              ) : availableSlots.length === 0 ? (
                <EmptyStateCard message={LABELS.noSlots} />
              ) : (
                <div className="space-y-3 px-4">
                  {availableSlots.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-[22px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-4 bakery-panel-shadow"
                    >
                      <p className="font-extrabold text-bakery-ink">
                        {new Date(s.startAt).toLocaleString("en-GB")}
                      </p>
                      <form
                        onSubmit={(e) => bookSlot(e, s.id)}
                        className="mt-3 space-y-2"
                      >
                        <Input name="customerName" label="Name" required />
                        <Input name="customerPhone" label="Phone" required />
                        <Textarea name="notes" label="Notes" rows={2} />
                        <Button type="submit" variant="square" className="w-full">
                          Book
                        </Button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </CustomerTabBody>
          )}

          {isAppointments && tab === 1 && (
            <CustomerTabBody>
              <EmptyStateCard message={LABELS.noMyAppts} />
            </CustomerTabBody>
          )}
        </>
      )}

      {!unavailable && (
        <CustomerBottomBar
          items={navItems}
          selectedIndex={navIndex}
          onSelect={onNavSelect}
        />
      )}
    </div>
  );
}
