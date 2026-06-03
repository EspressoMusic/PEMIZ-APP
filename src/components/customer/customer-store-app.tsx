"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HelpCircle,
  SlidersHorizontal,
  ShieldPlus,
  UserRound,
  MessagesSquare,
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
import {
  CustomerStoreTabNav,
  type CustomerMainTab,
} from "./customer-store-tab-nav";
import { CustomerFaqSheet } from "./customer-faq-sheet";
import { CustomerDisplaySheet } from "./customer-display-sheet";
import { CustomerLegalSheet } from "./customer-legal-sheet";
import { OrderCheckoutModal } from "./order-checkout-modal";
import { CelebrationModal } from "@/components/celebration-modal";
import { formatCustomerMoney } from "@/lib/customer-money";
import { getEffectivePrice } from "@/lib/product-price";
import { customerThemeClass, parseStoreTheme } from "@/lib/store-themes";
import {
  isProductInStock,
  maxOrderQuantity,
} from "@/lib/product-stock";
import {
  EmptyStateCard,
  OrdersHubPanel,
  SettingsMenuRow,
  ProductGridCard,
  DealCard,
  HubEmptyText,
} from "./customer-ui";
import { CustomerSellerNotice } from "./customer-seller-notice";
import { normalizePhone } from "@/lib/phone";
import { DEV_PREVIEW_INQUIRIES } from "@/lib/dev-preview-data";

type MyInquiry = {
  id: string;
  message: string;
  sellerReply: string | null;
  sellerReplyAt: string | null;
  createdAt: string;
};

function broadcastSeenKey(slug: string) {
  return `linky-broadcast-seen-${slug}`;
}

function inquiryPhoneKey(slug: string) {
  return `linky-inquiry-phone-${slug}`;
}

type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  salePrice?: number | null;
  stock?: number | null;
};

type StoreDeal = {
  id: string;
  name: string;
  dealPrice: number;
  validUntil: string;
  products: {
    id: string;
    name: string;
    imageUrl: string | null;
    price: number;
    salePrice?: number | null;
    stock?: number | null;
  }[];
};

function dealHasStock(deal: StoreDeal): boolean {
  return deal.products.every((p) => isProductInStock(p.stock));
}

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
    storeLocale?: string;
    storePolicy?: string | null;
    storeTerms?: string | null;
    storeBroadcast?: string | null;
    storeBroadcastAt?: string | null;
  };
  unavailable: boolean;
}) {
  const isAppointments = business.type === "APPOINTMENTS";
  const [mainTab, setMainTab] = useState<CustomerMainTab>("home");
  const [settingsInquiriesOpen, setSettingsInquiriesOpen] = useState(false);
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
  const [sellerNoticeOpen, setSellerNoticeOpen] = useState(false);
  const [sellerNoticeMessage, setSellerNoticeMessage] = useState("");
  const [sellerNoticeSentAt, setSellerNoticeSentAt] = useState<string | null>(
    null
  );
  const [myInquiries, setMyInquiries] = useState<MyInquiry[]>([]);
  const [inquirySent, setInquirySent] = useState(false);
  const [locale, setLocale] = useState<CustomerLocale>("en");
  const ownerTheme = parseStoreTheme(business.storeTheme);
  const ownerLocale: CustomerLocale =
    business.storeLocale === "en" ? "en" : "he";
  const [displayTheme, setDisplayTheme] =
    useState<CustomerDisplayTheme>(ownerTheme);
  const [textScale, setTextScale] = useState<CustomerTextScale>("100");

  const labels = useMemo(() => getCustomerLabels(locale), [locale]);

  useEffect(() => {
    const saved = localStorage.getItem(`linky-customer-${business.slug}`);
    if (saved) setCustomerName(saved);
    const prefs = loadCustomerPreferences(business.slug);
    const hasPrefs =
      typeof window !== "undefined" &&
      !!localStorage.getItem(`linky-customer-prefs-${business.slug}`);
    setLocale(hasPrefs ? prefs.locale : ownerLocale);
    setTextScale(prefs.textScale);
    setDisplayTheme(hasPrefs ? prefs.theme : ownerTheme);
  }, [business.slug, ownerTheme, ownerLocale]);

  useEffect(() => {
    if (unavailable) return;

    async function checkBroadcast() {
      let message: string | null = business.storeBroadcast ?? null;
      let sentAt: string | null = business.storeBroadcastAt ?? null;

      if (!message?.trim()) {
        try {
          const res = await fetch(`/api/public/${business.slug}/broadcast`);
          const data = await res.json();
          if (res.ok && data.message) {
            message = data.message;
            sentAt = data.sentAt ?? null;
          }
        } catch {
          return;
        }
      }

      if (!message?.trim() || !sentAt) return;
      const seen = localStorage.getItem(broadcastSeenKey(business.slug));
      if (seen === sentAt) return;
      setSellerNoticeMessage(message);
      setSellerNoticeSentAt(sentAt);
      setSellerNoticeOpen(true);
    }

    checkBroadcast();
  }, [business.slug, business.storeBroadcast, business.storeBroadcastAt, unavailable]);

  const loadMyInquiries = useCallback(
    async (phoneRaw: string) => {
      const phone = normalizePhone(phoneRaw);
      if (phone.length < 9) {
        setMyInquiries([]);
        return;
      }

      if (business.slug === "demo-store") {
        const matched = DEV_PREVIEW_INQUIRIES.filter(
          (row) =>
            row.customerPhone &&
            normalizePhone(row.customerPhone) === phone
        ).map((row) => ({
          id: row.id,
          message: row.message,
          sellerReply: row.sellerReply,
          sellerReplyAt: row.sellerReplyAt,
          createdAt: row.createdAt,
        }));
        setMyInquiries(matched);
        return;
      }

      try {
        const res = await fetch(
          `/api/public/${business.slug}/inquiry-updates?phone=${encodeURIComponent(phoneRaw)}`
        );
        const data = await res.json();
        if (res.ok) setMyInquiries(data.inquiries ?? []);
      } catch {
        setMyInquiries([]);
      }
    },
    [business.slug]
  );

  useEffect(() => {
    if (unavailable) return;
    const stored = localStorage.getItem(inquiryPhoneKey(business.slug));
    const phone = orderPhone || stored || "";
    if (phone) loadMyInquiries(phone);
  }, [orderPhone, business.slug, unavailable, loadMyInquiries]);

  function dismissSellerNotice() {
    const sentAt = sellerNoticeSentAt ?? business.storeBroadcastAt;
    if (sentAt) {
      localStorage.setItem(broadcastSeenKey(business.slug), sentAt);
    }
    setSellerNoticeOpen(false);
  }

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
    if (!dealHasStock(deal)) return;
    setOrderError("");
    setPendingDeal(deal);
    setOrderCheckoutOpen(true);
  }

  async function sendInquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const phone = String(fd.get("customerPhone") ?? "").trim();
    const res = await fetch(`/api/public/${business.slug}/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: fd.get("customerName"),
        customerPhone: phone,
        message: fd.get("message"),
      }),
    });
    if (res.ok) {
      if (phone) {
        localStorage.setItem(inquiryPhoneKey(business.slug), phone);
        setOrderPhone(phone);
        await loadMyInquiries(phone);
      }
      setInquirySent(true);
      setTimeout(() => setInquirySent(false), 3000);
    }
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

  function renderStoreHeader() {
    if (!business.description?.trim()) return null;
    return (
      <p className="text-[14px] leading-snug text-bakery-muted">
        {business.description}
      </p>
    );
  }

  function renderProductGrid() {
    if (business.products.length === 0) {
      return <EmptyStateCard message={labels.noServices} />;
    }
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {business.products.map((p) => {
          const outOfStock = !isProductInStock(p.stock);
          const maxQty = maxOrderQuantity(p.stock);
          return (
            <ProductGridCard
              key={p.id}
              name={p.name}
              description={p.description}
              imageUrl={p.imageUrl}
              locale={locale}
              price={p.price}
              salePrice={p.salePrice}
              qty={cart[p.id] ?? 0}
              outOfStock={outOfStock}
              outOfStockLabel={labels.outOfStock}
              maxQty={maxQty}
              onDec={() =>
                setCart((c) => ({
                  ...c,
                  [p.id]: Math.max(0, (c[p.id] ?? 0) - 1),
                }))
              }
              onInc={() =>
                setCart((c) => ({
                  ...c,
                  [p.id]: Math.min(maxQty, (c[p.id] ?? 0) + 1),
                }))
              }
            />
          );
        })}
      </div>
    );
  }

  function renderDealsGrid() {
    if (activeDeals.length === 0) {
      return <EmptyStateCard message={labels.noDeals} />;
    }
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {activeDeals.map((d) => (
          <DealCard
            key={d.id}
            name={d.name}
            dealPrice={d.dealPrice}
            validUntil={d.validUntil}
            products={d.products}
            locale={locale}
            labels={labels}
            redeemDisabled={!dealHasStock(d)}
            onRedeem={() => startDealCheckout(d)}
          />
        ))}
      </div>
    );
  }

  function renderInquiriesBlock() {
    return (
      <div className="space-y-3">
        {inquirySent && (
          <p className="text-center text-[14px] font-semibold text-bakery-success">
            {labels.inquirySent}
          </p>
        )}
        {myInquiries.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[16px] font-extrabold text-bakery-ink">
              {labels.yourInquiries}
            </h2>
            {myInquiries.map((inq) => (
              <Panel key={inq.id} className="space-y-2">
                <p className="whitespace-pre-wrap text-[15px] text-bakery-ink">
                  {inq.message}
                </p>
                {inq.sellerReply ? (
                  <div className="rounded-[14px] border border-bakery-primary/25 bg-bakery-primary/10 px-3 py-2">
                    <p className="text-[12px] font-bold text-bakery-primary">
                      {labels.sellerReplyLabel}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-[14px] text-bakery-ink">
                      {inq.sellerReply}
                    </p>
                  </div>
                ) : (
                  <p className="text-[13px] font-semibold text-bakery-muted">
                    {labels.awaitingReply}
                  </p>
                )}
              </Panel>
            ))}
          </div>
        )}
        <Panel>
          <form onSubmit={sendInquiry} className="space-y-3">
            <Input name="customerName" label={labels.name} required />
            <Input
              name="customerPhone"
              label={labels.phone}
              defaultValue={orderPhone}
            />
            <Textarea name="message" label={labels.message} rows={4} required />
            <Button type="submit" className="w-full min-h-[48px]">
              {labels.send}
            </Button>
          </form>
        </Panel>
      </div>
    );
  }

  function renderMainContent() {
    if (unavailable) {
      return (
        <div className="pt-2">
          <EmptyStateCard message={labels.unavailable} />
        </div>
      );
    }

    switch (mainTab) {
      case "home":
        return (
          <div className="space-y-5 pb-2">
            {renderStoreHeader()}
            <PageTitle>
              {isAppointments ? labels.appointments : labels.menu}
            </PageTitle>
            {isAppointments ? (
              availableSlots.length === 0 ? (
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
              )
            ) : (
              renderProductGrid()
            )}
          </div>
        );

      case "orders":
        return (
          <div className="space-y-5 pb-2">
            <PageTitle>
              {isAppointments ? labels.myAppointments : labels.orders}
            </PageTitle>
            {isAppointments ? (
              <EmptyStateCard message={labels.noMyAppts} />
            ) : (
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
            )}
          </div>
        );

      case "deals":
        return (
          <div className="space-y-5 pb-2">
            <PageTitle>{labels.deals}</PageTitle>
            {isAppointments ? (
              <EmptyStateCard message={labels.noDeals} />
            ) : (
              renderDealsGrid()
            )}
          </div>
        );

      case "settings":
        return (
          <div className="space-y-5 pb-2">
            <PageTitle>{labels.settings}</PageTitle>
            <div className="space-y-3">
              <SettingsMenuRow
                icon={HelpCircle}
                title={labels.faq}
                subtitle={labels.faqSub}
                onClick={() => setFaqOpen(true)}
              />
              <SettingsMenuRow
                icon={MessagesSquare}
                title={labels.contactSeller}
                subtitle={labels.inquiriesSub}
                onClick={() => setSettingsInquiriesOpen((v) => !v)}
              />
              {settingsInquiriesOpen && renderInquiriesBlock()}
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
        );

      default:
        return null;
    }
  }

  const rootLang = locale === "he" ? "he" : "en";
  const rootDir = locale === "he" ? "rtl" : "ltr";
  const themeClass = customerThemeClass(displayTheme);

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
            <CustomerStoreTabNav
              labels={labels}
              active={mainTab}
              onSelect={setMainTab}
              ordersBadge={isAppointments ? undefined : cartItemCount}
            />
          )}
          <main className="min-w-0 flex-1">{renderMainContent()}</main>
        </div>
      </div>

      <CustomerSellerNotice
        open={sellerNoticeOpen}
        message={sellerNoticeMessage}
        locale={locale}
        onClose={dismissSellerNotice}
      />

      <CustomerFaqSheet
        open={faqOpen}
        onClose={() => setFaqOpen(false)}
        items={business.faqItems}
        storePolicy={business.storePolicy}
        storeTerms={business.storeTerms}
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
