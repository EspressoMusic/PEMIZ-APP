"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  HelpCircle,
  SlidersHorizontal,
  ShieldPlus,
  UserRound,
  MessagesSquare,
  Settings,
} from "lucide-react";
import { Button, Input, Textarea, Panel } from "@/components/ui";
import {
  loadCustomerPreferences,
  saveCustomerPreferences,
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
  SettingsCollapsibleSection,
  SettingsMenuRow,
  ProductGridCard,
  DealCard,
  HubEmptyText,
  CartLineRow,
} from "./customer-ui";
import { CustomerSellerNoticeBanner } from "./customer-seller-notice-banner";
import { CustomerCenterModal } from "./customer-center-modal";
import {
  CustomerContactModal,
  type ContactView,
} from "./customer-contact-modal";
import {
  CUSTOMER_MOBILE_STACK,
  CUSTOMER_PAGE_ROOT,
  CUSTOMER_SCROLL_MAIN,
  CUSTOMER_VIEWPORT_HEIGHT,
} from "./customer-store-frame";
import { normalizePhone } from "@/lib/phone";
import { DEV_PREVIEW_INQUIRIES } from "@/lib/dev-preview-data";

type MyInquiry = {
  id: string;
  subject?: string;
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
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactView, setContactView] = useState<ContactView>("menu");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileDraftName, setProfileDraftName] = useState("");
  const [profileDraftPhone, setProfileDraftPhone] = useState("");
  const [profileSavedFlash, setProfileSavedFlash] = useState(false);
  const [orderPhone, setOrderPhone] = useState("");
  const [faqOpen, setFaqOpen] = useState(false);
  const [displayOpen, setDisplayOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [cartDeals, setCartDeals] = useState<StoreDeal[]>([]);
  const [orderCheckoutOpen, setOrderCheckoutOpen] = useState(false);
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [sellerNoticeUnread, setSellerNoticeUnread] = useState(false);
  const [sellerNoticeExpanded, setSellerNoticeExpanded] = useState(false);
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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(`linky-customer-${business.slug}`);
    if (saved) setCustomerName(saved);
    const savedPhone = localStorage.getItem(inquiryPhoneKey(business.slug));
    if (savedPhone) setOrderPhone(savedPhone);
    const prefs = loadCustomerPreferences(business.slug);
    const hasPrefs =
      typeof window !== "undefined" &&
      !!localStorage.getItem(`linky-customer-prefs-${business.slug}`);
    setLocale(hasPrefs ? prefs.locale : ownerLocale);
    setTextScale(prefs.textScale);
    setDisplayTheme(hasPrefs ? prefs.theme : ownerTheme);
  }, [business.slug, ownerTheme, ownerLocale]);

  useEffect(() => {
    if (!profileModalOpen) return;
    setProfileDraftName(customerName);
    setProfileDraftPhone(orderPhone);
    setProfileSavedFlash(false);
  }, [profileModalOpen, customerName, orderPhone]);

  function saveCustomerProfile() {
    const name = profileDraftName.trim();
    if (name.length < 2) return;
    const phone = profileDraftPhone.trim();
    setCustomerName(name);
    setOrderPhone(phone);
    localStorage.setItem(`linky-customer-${business.slug}`, name);
    localStorage.setItem(inquiryPhoneKey(business.slug), phone);
    if (phone) void loadMyInquiries(phone);
    setProfileSavedFlash(true);
    window.setTimeout(() => {
      setProfileModalOpen(false);
      setProfileSavedFlash(false);
    }, 700);
  }

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
      if (seen === sentAt) {
        setSellerNoticeMessage("");
        setSellerNoticeSentAt(null);
        setSellerNoticeUnread(false);
        setSellerNoticeExpanded(false);
        return;
      }

      setSellerNoticeMessage(message);
      setSellerNoticeSentAt(sentAt);
      setSellerNoticeUnread(true);
      setSellerNoticeExpanded(false);
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
          subject: row.subject,
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
    setSellerNoticeMessage("");
    setSellerNoticeSentAt(null);
    setSellerNoticeUnread(false);
    setSellerNoticeExpanded(false);
  }

  function toggleSellerNotice() {
    setSellerNoticeExpanded((open) => !open);
    if (!sellerNoticeExpanded) {
      setSellerNoticeUnread(false);
    }
  }

  const showSellerNoticeBanner =
    mainTab === "home" && sellerNoticeMessage.trim().length > 0;

  useEffect(() => {
    if (mainTab !== "home") {
      setSellerNoticeExpanded(false);
    }
  }, [mainTab]);

  useEffect(() => {
    if (mainTab !== "settings") setSettingsExpanded(false);
  }, [mainTab]);

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

  const dealsTotal = cartDeals.reduce((s, d) => s + d.dealPrice, 0);
  const checkoutTotal = cartTotal + dealsTotal;
  const activeOrderCount =
    cartLines.reduce((n, l) => n + l.qty, 0) + cartDeals.length;

  async function submitOrder(name: string, phone: string) {
    if (cartLines.length === 0 && cartDeals.length === 0) return;
    if (!name || !phone) {
      setOrderError(
        locale === "he" ? "יש למלא שם וטלפון" : "Please enter name and phone"
      );
      return;
    }
    setOrderError("");
    setOrderSubmitting(true);

    const payloadBase = {
      customerName: name,
      customerPhone: phone,
    };

    for (const deal of cartDeals) {
      const res = await fetch(`/api/public/${business.slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payloadBase, dealId: deal.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setOrderSubmitting(false);
        setOrderError(
          (data as { error?: string }).error ??
            (locale === "he" ? "שגיאה בשליחת ההזמנה" : "Could not place order")
        );
        return;
      }
    }

    if (cartLines.length > 0) {
      const res = await fetch(`/api/public/${business.slug}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payloadBase,
          items: cartLines.map((l) => ({
            productId: l.product.id,
            quantity: l.qty,
          })),
        }),
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
    } else {
      setOrderSubmitting(false);
    }

    setCustomerName(name);
    setOrderPhone(phone);
    localStorage.setItem(`linky-customer-${business.slug}`, name);
    localStorage.setItem(inquiryPhoneKey(business.slug), phone);
    setCart({});
    setCartDeals([]);
    setOrderCheckoutOpen(false);
    setOrderSuccessOpen(true);
  }

  function addDealToActiveOrders(deal: StoreDeal) {
    if (!dealHasStock(deal)) return;
    setCartDeals((prev) =>
      prev.some((d) => d.id === deal.id) ? prev : [...prev, deal]
    );
    setMainTab("orders");
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
        subject: fd.get("subject"),
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

  const cartItemCount = activeOrderCount;

  function renderProductGrid() {
    if (business.products.length === 0) {
      return <EmptyStateCard message={labels.noServices} />;
    }
    return (
      <div className="grid grid-cols-2 items-stretch gap-2.5">
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
              storeTheme={displayTheme}
              infoLabel={labels.productInfo}
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
      <div className="grid grid-cols-2 items-start gap-2.5">
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
            onRedeem={() => addDealToActiveOrders(d)}
          />
        ))}
      </div>
    );
  }

  function openContactModal() {
    setContactView("menu");
    setContactModalOpen(true);
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
          <div className="space-y-4 pb-2">
            {isAppointments ? (
              availableSlots.length === 0 ? (
                <EmptyStateCard message={labels.noSlots} />
              ) : (
                <div className="grid grid-cols-1 gap-4">
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
              <div className="bakery-float-panel rounded-[24px] p-3">
                {renderProductGrid()}
              </div>
            )}
          </div>
        );

      case "orders":
        return (
          <div className="space-y-4 pb-2">
            {isAppointments ? (
              <EmptyStateCard message={labels.noMyAppts} />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <OrdersHubPanel title={labels.activeOrders}>
                  {cartLines.length === 0 && cartDeals.length === 0 ? (
                    <HubEmptyText>{labels.cartEmpty}</HubEmptyText>
                  ) : (
                    <>
                      <ul className="space-y-2 py-2">
                        {cartDeals.map((d) => (
                          <CartLineRow
                            key={`deal-${d.id}`}
                            name={d.name}
                            imageUrl={d.products[0]?.imageUrl}
                            qty={1}
                            lineTotal={d.dealPrice}
                            locale={locale}
                          />
                        ))}
                        {cartLines.map((l) => (
                          <CartLineRow
                            key={l.product.id}
                            name={l.product.name}
                            imageUrl={l.product.imageUrl}
                            qty={l.qty}
                            lineTotal={getEffectivePrice(l.product) * l.qty}
                            locale={locale}
                          />
                        ))}
                        <li className="border-t border-bakery-border/40 pt-2 font-extrabold">
                          {labels.total}:{" "}
                          {formatCustomerMoney(checkoutTotal, locale)}
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
          <div className="pb-2">
            {isAppointments ? (
              <EmptyStateCard message={labels.noDeals} />
            ) : (
              <div className="bakery-float-panel rounded-[24px] p-2.5">
                {renderDealsGrid()}
              </div>
            )}
          </div>
        );

      case "settings":
        return (
          <div className="space-y-4 pb-2">
            <div className="bakery-float-panel space-y-2 rounded-[24px] p-3">
              <SettingsMenuRow
                icon={HelpCircle}
                title={labels.faq}
                onClick={() => setFaqOpen(true)}
              />
              <SettingsMenuRow
                icon={MessagesSquare}
                title={labels.contactSeller}
                onClick={openContactModal}
              />
              <SettingsCollapsibleSection
                title={labels.settings}
                icon={Settings}
                expanded={settingsExpanded}
                onToggle={() => setSettingsExpanded((open) => !open)}
              >
                <SettingsMenuRow
                  icon={UserRound}
                  title={labels.signIn}
                  onClick={() => setProfileModalOpen(true)}
                />
                <SettingsMenuRow
                  icon={SlidersHorizontal}
                  title={labels.language}
                  onClick={() => setDisplayOpen(true)}
                />
                <SettingsMenuRow
                  icon={ShieldPlus}
                  title={labels.legal}
                  onClick={() => setLegalOpen(true)}
                />
              </SettingsCollapsibleSection>
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
      className={`customer-store-root ${themeClass} ${textScaleClass} flex h-full min-h-0 w-full flex-col overflow-hidden`}
    >
      <div className={CUSTOMER_VIEWPORT_HEIGHT}>
        <div className={`${CUSTOMER_MOBILE_STACK} ${CUSTOMER_PAGE_ROOT}`}>
          {!unavailable && showSellerNoticeBanner && (
            <div className="shrink-0">
              <CustomerSellerNoticeBanner
                message={sellerNoticeMessage}
                labels={labels}
                expanded={sellerNoticeExpanded}
                onToggle={toggleSellerNotice}
                onDismiss={dismissSellerNotice}
                unread={sellerNoticeUnread}
              />
            </div>
          )}
          <main className={CUSTOMER_SCROLL_MAIN}>{renderMainContent()}</main>
        </div>
      </div>

      {!unavailable && (
        <CustomerStoreTabNav
          labels={labels}
          active={mainTab}
          onSelect={setMainTab}
          ordersBadge={isAppointments ? undefined : cartItemCount}
        />
      )}

      <CustomerFaqSheet
        open={faqOpen}
        onClose={() => setFaqOpen(false)}
        items={business.faqItems}
        storeTerms={business.storeTerms}
        locale={locale}
        storeTheme={displayTheme}
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
        locale={locale}
        textScale={textScale}
        onTextScaleChange={(s) => updatePreferences({ textScale: s })}
        storeTheme={displayTheme}
      />

      <CustomerContactModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        view={contactView}
        onViewChange={setContactView}
        slug={business.slug}
        locale={locale}
        storeTheme={displayTheme}
        labels={labels}
        customerName={customerName}
        customerPhone={orderPhone}
        isDevPreview={business.slug === "demo-store"}
        myInquiries={myInquiries}
        inquirySent={inquirySent}
        onSubmitInquiry={sendInquiry}
      />

      <CustomerCenterModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        locale={locale}
        storeTheme={displayTheme}
        title={labels.signIn}
      >
        <div className="space-y-3 px-4 py-4">
          {profileSavedFlash && (
            <p className="text-center text-[14px] font-semibold text-bakery-success">
              {labels.profileSaved}
            </p>
          )}
          <Input
            label={labels.yourName}
            value={profileDraftName}
            autoComplete="name"
            onChange={(e) => setProfileDraftName(e.target.value)}
          />
          <Input
            label={labels.yourPhone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            className="text-start"
            value={profileDraftPhone}
            onChange={(e) => setProfileDraftPhone(e.target.value)}
          />
          <Button
            type="button"
            variant="primary"
            className="w-full min-h-[48px] font-extrabold"
            disabled={profileDraftName.trim().length < 2}
            onClick={saveCustomerProfile}
          >
            {labels.saveMe}
          </Button>
        </div>
      </CustomerCenterModal>

      <OrderCheckoutModal
        open={orderCheckoutOpen}
        onClose={() => setOrderCheckoutOpen(false)}
        locale={locale}
        total={checkoutTotal}
        summary={
          cartDeals.length > 0
            ? `${labels.deals}: ${cartDeals.map((d) => d.name).join(", ")}`
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
