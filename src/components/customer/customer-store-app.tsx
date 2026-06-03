"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Settings,
  Receipt,
  HelpCircle,
  SlidersHorizontal,
  ShieldPlus,
  UserRound,
  Calendar,
  CalendarCheck,
} from "lucide-react";
import { Button, Input, Textarea, PageTitle, Panel } from "@/components/ui";
import {
  loadCustomerPreferences,
  saveCustomerPreferences,
  localeThemeSummary,
  type CustomerDisplayTheme,
  type CustomerLocale,
  type CustomerTextScale,
} from "@/lib/customer-preferences";
import { getCustomerLabels } from "./customer-labels";
import { CustomerStoreHubNav } from "./customer-store-hub-nav";
import { CustomerStoreDashboard } from "./customer-store-dashboard";
import {
  CustomerStoreActions,
  type CustomerActionTab,
} from "./customer-store-actions";
import { CustomerFaqSheet } from "./customer-faq-sheet";
import { CustomerDisplaySheet } from "./customer-display-sheet";
import { CustomerLegalSheet } from "./customer-legal-sheet";
import { OrderCheckoutModal } from "./order-checkout-modal";
import { CelebrationModal } from "@/components/celebration-modal";
import { formatCustomerMoney } from "@/lib/customer-money";
import { getEffectivePrice } from "@/lib/product-price";
import {
  EmptyStateCard,
  OrdersHubPanel,
  SettingsMenuRow,
  ProductGridCard,
  DealCard,
  HubEmptyText,
} from "./customer-ui";

type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  salePrice?: number | null;
};

type StoreDeal = {
  id: string;
  name: string;
  dealPrice: number;
  validUntil: string;
  productA: {
    id: string;
    name: string;
    imageUrl: string | null;
    price: number;
    salePrice?: number | null;
  };
  productB: {
    id: string;
    name: string;
    imageUrl: string | null;
    price: number;
    salePrice?: number | null;
  };
};

type Slot = {
  id: string;
  startAt: string;
  endAt: string;
  maxBookings: number;
  appointments: unknown[];
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const TAB_MENU = 0;
const TAB_ORDERS = 1;
const TAB_INQUIRIES = 2;
const TAB_SETTINGS = 3;

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
    deals?: StoreDeal[];
    slots: Slot[];
    faqItems: FaqItem[];
    storeUrl: string;
    storeTheme?: string;
  };
  unavailable: boolean;
}) {
  const isAppointments = business.type === "APPOINTMENTS";
  const [hub, setHub] = useState<"dashboard" | "actions">("dashboard");
  const [actionTab, setActionTab] = useState<CustomerActionTab | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [orderPhone, setOrderPhone] = useState("");
  const [faqOpen, setFaqOpen] = useState(false);
  const [displayOpen, setDisplayOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [orderCheckoutOpen, setOrderCheckoutOpen] = useState(false);
  const [pendingDeal, setPendingDeal] = useState<StoreDeal | null>(null);
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [locale, setLocale] = useState<CustomerLocale>("en");
  const ownerTheme: CustomerDisplayTheme =
    business.storeTheme === "light" || business.storeTheme === "dark"
      ? business.storeTheme
      : "calm";
  const [displayTheme, setDisplayTheme] =
    useState<CustomerDisplayTheme>(ownerTheme);
  const [textScale, setTextScale] = useState<CustomerTextScale>("100");

  const labels = useMemo(() => getCustomerLabels(locale), [locale]);

  useEffect(() => {
    const saved = localStorage.getItem(`linky-customer-${business.slug}`);
    if (saved) setCustomerName(saved);
    const prefs = loadCustomerPreferences(business.slug);
    setLocale(prefs.locale);
    setTextScale(prefs.textScale);
    const hasPrefs =
      typeof window !== "undefined" &&
      !!localStorage.getItem(`linky-customer-prefs-${business.slug}`);
    setDisplayTheme(hasPrefs ? prefs.theme : ownerTheme);
  }, [business.slug, ownerTheme]);

  function updatePreferences(
    patch: Partial<{
      locale: CustomerLocale;
      theme: CustomerDisplayTheme;
      textScale: CustomerTextScale;
    }>
  ) {
    const next = {
      locale: patch.locale ?? locale,
      theme: patch.theme ?? displayTheme,
      textScale: patch.textScale ?? textScale,
    };
    setLocale(next.locale);
    setDisplayTheme(next.theme);
    setTextScale(next.textScale);
    saveCustomerPreferences(business.slug, next);
  }

  const openAction = useCallback((tab: CustomerActionTab) => {
    setHub("actions");
    setActionTab(tab);
  }, []);

  const cartLines = useMemo(
    () =>
      business.products
        .filter((p) => (cart[p.id] ?? 0) > 0)
        .map((p) => ({ product: p, qty: cart[p.id] ?? 0 })),
    [business.products, cart]
  );

  const cartTotal = cartLines.reduce(
    (s, l) => s + getEffectivePrice(l.product) * l.qty,
    0
  );

  const activeDeals = useMemo(() => {
    const list = business.deals ?? [];
    const now = Date.now();
    return list.filter((d) => new Date(d.validUntil).getTime() > now);
  }, [business.deals]);

  const checkoutTotal = pendingDeal ? pendingDeal.dealPrice : cartTotal;

  async function submitOrder(name: string, phone: string) {
    const isDeal = !!pendingDeal;
    if (!isDeal && cartLines.length === 0) return;
    if (!name || !phone) {
      setOrderError(
        locale === "he" ? "יש למלא שם וטלפון" : "Please enter name and phone"
      );
      return;
    }
    setOrderError("");
    setOrderSubmitting(true);
    const res = await fetch(`/api/public/${business.slug}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isDeal
          ? {
              customerName: name,
              customerPhone: phone,
              dealId: pendingDeal.id,
            }
          : {
              customerName: name,
              customerPhone: phone,
              items: cartLines.map((l) => ({
                productId: l.product.id,
                quantity: l.qty,
              })),
            }
      ),
    });
    setOrderSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setOrderError(
        (data as { error?: string }).error ??
          (locale === "he" ? "שגיאה בשליחת ההזמנה" : "Could not place order")
      );
      return;
    }
    setCustomerName(name);
    setOrderPhone(phone);
    localStorage.setItem(`linky-customer-${business.slug}`, name);
    setCart({});
    setPendingDeal(null);
    setOrderCheckoutOpen(false);
    setOrderSuccessOpen(true);
  }

  function startDealCheckout(deal: StoreDeal) {
    setOrderError("");
    setPendingDeal(deal);
    setOrderCheckoutOpen(true);
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

  const cartItemCount = cartLines.reduce((n, l) => n + l.qty, 0);

  function renderActionPage() {
    const tab =
      actionTab === "menu"
        ? isAppointments
          ? 2
          : TAB_MENU
        : actionTab === "orders"
          ? TAB_ORDERS
          : actionTab === "inquiries"
            ? TAB_INQUIRIES
            : actionTab === "settings"
              ? TAB_SETTINGS
              : actionTab === "myAppointments"
                ? 1
                : -1;

    return (
      <>
          {tab === TAB_SETTINGS && (
            <div className="space-y-5">
              <PageTitle>{labels.settings}</PageTitle>
              <div className="space-y-3">
                <SettingsMenuRow
                  icon={HelpCircle}
                  title={labels.faq}
                  subtitle={labels.faqSub}
                  onClick={() => setFaqOpen(true)}
                />

                <SettingsMenuRow
                  icon={SlidersHorizontal}
                  title={labels.language}
                  subtitle={localeThemeSummary(locale, displayTheme)}
                  onClick={() => setDisplayOpen(true)}
                />

                <SettingsMenuRow
                  icon={ShieldPlus}
                  title={labels.legal}
                  subtitle={labels.legalSub}
                  onClick={() => setLegalOpen(true)}
                />

                <SettingsMenuRow
                  icon={UserRound}
                  title={labels.signIn}
                  subtitle={labels.signInSub}
                  onClick={() => setProfileOpen(!profileOpen)}
                />

                {profileOpen && (
                  <div className="rounded-[22px] border-[1.2px] border-bakery-border/45 bg-bakery-square p-4 bakery-panel-shadow">
                    <Input
                      label={labels.yourName}
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
          )}

          {tab === TAB_INQUIRIES && (
            <div className="space-y-5">
              <PageTitle>{labels.inquiries}</PageTitle>
              <Panel>
                <form onSubmit={sendInquiry} className="space-y-3">
                  <Input name="customerName" label={labels.name} required />
                  <Input name="customerPhone" label={labels.phone} />
                  <Textarea name="message" label={labels.message} rows={4} required />
                  <Button type="submit" className="w-full min-h-[48px]">
                    {labels.send}
                  </Button>
                </form>
              </Panel>
            </div>
          )}

          {!isAppointments && tab === TAB_ORDERS && (
            <div className="space-y-5">
              <PageTitle>{labels.orders}</PageTitle>
              <div className="grid gap-6 lg:grid-cols-2">
                <OrdersHubPanel title={labels.activeOrders}>
                  {cartLines.length === 0 ? (
                    <HubEmptyText>{labels.cartEmpty}</HubEmptyText>
                  ) : (
                    <>
                      <ul className="space-y-1.5 py-2 text-start text-[15px] text-bakery-ink">
                        {cartLines.map((l) => (
                          <li
                            key={l.product.id}
                            className="flex justify-between gap-2 font-semibold"
                          >
                            <span>
                              {l.product.name} × {l.qty}
                            </span>
                            <span className="shrink-0">
                              {formatCustomerMoney(
                                getEffectivePrice(l.product) * l.qty,
                                locale
                              )}
                            </span>
                          </li>
                        ))}
                        <li className="border-t border-bakery-border/40 pt-2 font-extrabold">
                          {labels.total}: {formatCustomerMoney(cartTotal, locale)}
                        </li>
                      </ul>
                      <Button
                        type="button"
                        className="mt-3 w-full min-h-[48px]"
                        onClick={() => {
                          setOrderError("");
                          setOrderCheckoutOpen(true);
                        }}
                      >
                        {labels.confirmOrder}
                      </Button>
                    </>
                  )}
                </OrdersHubPanel>

                <OrdersHubPanel title={labels.orderHistory}>
                  <HubEmptyText>{labels.noPastOrders}</HubEmptyText>
                </OrdersHubPanel>
              </div>
            </div>
          )}

          {((!isAppointments && tab === TAB_MENU) ||
            (isAppointments && tab === 2)) && (
            <div className="space-y-5">
              <PageTitle>
                {isAppointments ? labels.appointments : labels.menu}
              </PageTitle>
              {!isAppointments ? (
                business.products.length === 0 && activeDeals.length === 0 ? (
                  <EmptyStateCard message={labels.noServices} />
                ) : (
                  <div className="space-y-6">
                    {activeDeals.length > 0 && (
                      <section>
                        <h2 className="mb-3 text-[18px] font-extrabold text-bakery-ink">
                          {labels.deals}
                        </h2>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {activeDeals.map((d) => (
                            <DealCard
                              key={d.id}
                              name={d.name}
                              dealPrice={d.dealPrice}
                              validUntil={d.validUntil}
                              productA={d.productA}
                              productB={d.productB}
                              locale={locale}
                              labels={labels}
                              onRedeem={() => startDealCheckout(d)}
                            />
                          ))}
                        </div>
                      </section>
                    )}
                    {business.products.length > 0 && (
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
                        {business.products.map((p) => (
                          <ProductGridCard
                            key={p.id}
                            name={p.name}
                            description={p.description}
                            imageUrl={p.imageUrl}
                            locale={locale}
                            price={p.price}
                            salePrice={p.salePrice}
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
                    )}
                  </div>
                )
              ) : availableSlots.length === 0 ? (
                <EmptyStateCard message={labels.noSlots} />
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {availableSlots.map((s) => (
                    <Panel key={s.id}>
                      <p className="font-extrabold text-bakery-ink">
                        {new Date(s.startAt).toLocaleString("en-GB")}
                      </p>
                      <form
                        onSubmit={(e) => bookSlot(e, s.id)}
                        className="mt-3 space-y-2"
                      >
                        <Input name="customerName" label={labels.name} required />
                        <Input name="customerPhone" label={labels.phone} required />
                        <Textarea name="notes" label={labels.notes} rows={2} />
                        <Button type="submit" variant="square" className="w-full">
                          {labels.book}
                        </Button>
                      </form>
                    </Panel>
                  ))}
                </div>
              )}
            </div>
          )}

          {isAppointments && tab === 1 && (
            <div className="space-y-5">
              <PageTitle>{labels.myAppointments}</PageTitle>
              <EmptyStateCard message={labels.noMyAppts} />
            </div>
          )}
      </>
    );
  }

  function renderHubMain() {
    if (unavailable) {
      return (
        <div className="pt-2">
          <EmptyStateCard message={labels.unavailable} />
        </div>
      );
    }

    if (hub === "dashboard") {
      return (
        <CustomerStoreDashboard
          businessName={business.name}
          description={business.description}
          labels={labels}
          locale={locale}
          cartItemCount={cartItemCount}
          cartTotal={cartTotal}
          isAppointments={isAppointments}
          onShop={() => openAction("menu")}
          onOrders={() => openAction("orders")}
          onInquiries={() => openAction("inquiries")}
        />
      );
    }

    return (
      <CustomerStoreActions
        labels={labels}
        isAppointments={isAppointments}
        pageTab={actionTab}
        cartCount={cartItemCount}
        onOpenTab={setActionTab}
        onBack={() => setActionTab(null)}
        onFaq={() => setFaqOpen(true)}
        onDisplay={() => setDisplayOpen(true)}
        onLegal={() => setLegalOpen(true)}
      >
        {actionTab ? renderActionPage() : null}
      </CustomerStoreActions>
    );
  }

  const rootLang = locale === "he" ? "he" : "en";
  const rootDir = locale === "he" ? "rtl" : "ltr";
  const themeClass =
    displayTheme === "light"
      ? "customer-theme-light"
      : displayTheme === "dark"
        ? "customer-theme-dark"
        : "customer-theme-calm";

  const textScaleClass =
    textScale === "125"
      ? "customer-text-scale-125"
      : textScale === "110"
        ? "customer-text-scale-110"
        : "customer-text-scale-100";

  return (
    <div
      lang={rootLang}
      dir={rootDir}
      className={`customer-store-root ${themeClass} ${textScaleClass}`}
    >
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 pb-[calc(76px+env(safe-area-inset-bottom))] sm:py-6 lg:px-[14px] lg:pb-8 lg:py-8">
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:gap-8">
          {!unavailable && (
            <CustomerStoreHubNav
              dashboardLabel={labels.dashboard}
              actionsLabel={labels.storeActions}
              hubActive={hub}
              onDashboard={() => {
                setHub("dashboard");
                setActionTab(null);
              }}
              onActions={() => {
                setHub("actions");
                setActionTab(null);
              }}
            />
          )}
          <main className="min-w-0 flex-1">{renderHubMain()}</main>
        </div>
      </div>

      <CustomerFaqSheet
        open={faqOpen}
        onClose={() => setFaqOpen(false)}
        items={business.faqItems}
        locale={locale}
      />

      <CustomerDisplaySheet
        open={displayOpen}
        onClose={() => setDisplayOpen(false)}
        locale={locale}
        theme={displayTheme}
        onLocaleChange={(l) => updatePreferences({ locale: l })}
        onThemeChange={(t) => updatePreferences({ theme: t })}
      />

      <CustomerLegalSheet
        open={legalOpen}
        onClose={() => setLegalOpen(false)}
        storeUrl={business.storeUrl}
        locale={locale}
        textScale={textScale}
        onTextScaleChange={(s) => updatePreferences({ textScale: s })}
      />

      <OrderCheckoutModal
        open={orderCheckoutOpen}
        onClose={() => {
          setOrderCheckoutOpen(false);
          setPendingDeal(null);
        }}
        locale={locale}
        total={checkoutTotal}
        summary={
          pendingDeal
            ? `${labels.deals}: ${pendingDeal.name}`
            : undefined
        }
        initialName={customerName}
        initialPhone={orderPhone}
        submitting={orderSubmitting}
        error={orderError}
        onSubmit={(name, phone) => {
          setCustomerName(name);
          setOrderPhone(phone);
          void submitOrder(name, phone);
        }}
      />

      <CelebrationModal
        open={orderSuccessOpen}
        onClose={() => setOrderSuccessOpen(false)}
        title={labels.orderSuccessTitle}
        detail={labels.orderSuccessDetail}
        buttonLabel={labels.great}
        closeAriaLabel={labels.close}
      />
    </div>
  );
}
