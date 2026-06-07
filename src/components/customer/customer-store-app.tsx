"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  HelpCircle,
  History,
  Receipt,
  SlidersHorizontal,
  ShieldPlus,
  UserRound,
  MessagesSquare,
  Settings,
  Smartphone,
} from "lucide-react";
import { Button, Input, Textarea } from "@/components/ui";
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
import { CustomerInstallAppSheet } from "./customer-install-app-sheet";
import { OrderCheckoutModal } from "./order-checkout-modal";
import { formatCustomerMoney } from "@/lib/customer-money";
import { getEffectivePrice } from "@/lib/product-price";
import { customerThemeClass, parseStoreTheme } from "@/lib/store-themes";
import type { PlatformLegalDocPayload } from "@/lib/legal/platform-legal";
import {
  canFulfillQuantity,
  isProductInStock,
  maxOrderQuantity,
} from "@/lib/product-stock";
import {
  EmptyStateCard,
  SettingsCollapsibleSection,
  SettingsMenuRow,
  SettingsMenuSubRow,
  ProductGridCard,
  DealCard,
  HubEmptyText,
  OrderHistorySummaryRow,
  OrderPreviewCard,
  AppointmentPreviewCard,
  type OrderPreviewLine,
} from "./customer-ui";
import {
  addPendingDeal,
  clearPendingDeals,
  loadPendingDeals,
  pendingDealsToSnapshots,
  removePendingDeals,
} from "@/lib/customer-pending-deals";
import {
  appendCustomerOrderHistory,
  loadCustomerOrderHistory,
  type CustomerOrderHistoryEntry,
} from "@/lib/customer-order-history";
import { CustomerSellerNoticeBanner } from "./customer-seller-notice-banner";
import {
  CustomerAppointmentCalendar,
  type AppointmentSlot,
} from "./customer-appointment-calendar";
import { CustomerAppointmentDayModal } from "./customer-appointment-day-modal";
import { CustomerAppointmentOpenSlotsPanel } from "./customer-appointment-open-slots-panel";
import { CustomerAppointmentReminderRow } from "./customer-appointment-reminder-row";
import { CustomerAppointmentBookingModal } from "./customer-appointment-booking-modal";
import {
  appendCustomerAppointmentHistory,
  buildAppointmentNotes,
  loadCustomerAppointmentHistory,
  updateCustomerAppointmentHistory,
  type CustomerAppointmentEntry,
} from "@/lib/customer-appointment-history";
import {
  canCustomerCancelAppointment,
  parseAppointmentCancelPolicy,
} from "@/lib/appointment-cancel-policy";
import { CustomerCenterModal } from "./customer-center-modal";
import type { ContactView } from "./customer-contact-modal";

const CustomerContactModal = dynamic(
  () =>
    import("./customer-contact-modal").then((m) => ({
      default: m.CustomerContactModal,
    })),
  { ssr: false }
);

const CelebrationModal = dynamic(
  () =>
    import("@/components/celebration-modal").then((m) => ({
      default: m.CelebrationModal,
    })),
  { ssr: false }
);
import {
  CUSTOMER_MOBILE_STACK,
  CUSTOMER_PAGE_ROOT,
  CUSTOMER_SCROLL_MAIN,
  CUSTOMER_SCROLL_MAIN_APPOINTMENTS_HOME,
  CUSTOMER_VIEWPORT_HEIGHT,
} from "./customer-store-frame";
import { normalizePhone } from "@/lib/phone";
import { DEV_PREVIEW_INQUIRIES } from "@/lib/dev-preview-data";
import { DashboardConfettiBackground } from "@/components/dashboard/dashboard-confetti-background";

const PRODUCT_CONFETTI_MS = 2800;

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
    quantity?: number;
  }[];
};

function dealHasStock(deal: StoreDeal): boolean {
  return deal.products.every((p) =>
    canFulfillQuantity(p.stock, Math.max(1, p.quantity ?? 1))
  );
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

type DemoOrderPreview = {
  id: string;
  placedAt: string;
  statusLabel: string;
  lines: OrderPreviewLine[];
  total: number;
};

export function CustomerStoreApp({
  business,
  unavailable,
  platformLegalDocs = [],
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
    orderScheduleEnabled?: boolean;
    orderSchedule?: string | null;
    appointmentBookingByDay?: boolean;
    storeBroadcast?: string | null;
    storeBroadcastAt?: string | null;
    demoOrders?: {
      active: DemoOrderPreview[];
      history: DemoOrderPreview[];
    };
  };
  unavailable: boolean;
  platformLegalDocs?: PlatformLegalDocPayload[];
}) {
  const isAppointments = business.type === "APPOINTMENTS";
  const isDevAppointments = business.slug === "demo-appointments";
  const appointmentCancelPolicy = parseAppointmentCancelPolicy(
    business.storeTerms
  );
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
  const [installAppOpen, setInstallAppOpen] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [cartDeals, setCartDeals] = useState<StoreDeal[]>([]);
  const [orderCheckoutOpen, setOrderCheckoutOpen] = useState(false);
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);
  const [activeOrdersOpen, setActiveOrdersOpen] = useState(false);
  const [historyOrdersOpen, setHistoryOrdersOpen] = useState(false);
  const [localOrderHistory, setLocalOrderHistory] = useState<
    CustomerOrderHistoryEntry[]
  >([]);
  const [historyDetailOrder, setHistoryDetailOrder] =
    useState<CustomerOrderHistoryEntry | null>(null);
  const prevActiveOrderCountRef = useRef(0);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [productConfettiActive, setProductConfettiActive] = useState(false);
  const [productConfettiBurst, setProductConfettiBurst] = useState(0);
  const productConfettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [sellerNoticeUnread, setSellerNoticeUnread] = useState(false);
  const [sellerNoticeExpanded, setSellerNoticeExpanded] = useState(false);
  const [sellerNoticeMessage, setSellerNoticeMessage] = useState("");
  const [sellerNoticeSentAt, setSellerNoticeSentAt] = useState<string | null>(
    null
  );
  const [myInquiries, setMyInquiries] = useState<MyInquiry[]>([]);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySubmitError, setInquirySubmitError] = useState("");
  const [inquirySuccessOpen, setInquirySuccessOpen] = useState(false);
  const inquirySubmitLockRef = useRef(false);
  const [localAppointments, setLocalAppointments] = useState<
    CustomerAppointmentEntry[]
  >([]);
  const [dayViewOpen, setDayViewOpen] = useState(false);
  const [dayViewKey, setDayViewKey] = useState<string | null>(null);
  const [dayViewSlots, setDayViewSlots] = useState<AppointmentSlot[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDay, setBookingDay] = useState<string | null>(null);
  const [bookingSlots, setBookingSlots] = useState<AppointmentSlot[]>([]);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [appointmentSuccessOpen, setAppointmentSuccessOpen] = useState(false);
  const ownerTheme = parseStoreTheme(business.storeTheme);
  const ownerLocale: CustomerLocale =
    business.storeLocale === "en" ? "en" : "he";
  const [locale, setLocale] = useState<CustomerLocale>(ownerLocale);
  const [displayTheme, setDisplayTheme] =
    useState<CustomerDisplayTheme>(ownerTheme);
  const [textScale, setTextScale] = useState<CustomerTextScale>("100");

  const labels = useMemo(() => getCustomerLabels(locale), [locale]);

  useEffect(() => {
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    setLocalOrderHistory(loadCustomerOrderHistory(business.slug));
    setCartDeals(pendingDealsToSnapshots(loadPendingDeals(business.slug)));
    setLocalAppointments(loadCustomerAppointmentHistory(business.slug));
  }, [business.slug]);

  const syncPendingDeals = useCallback(() => {
    const pending = loadPendingDeals(business.slug);
    setCartDeals(pendingDealsToSnapshots(pending));
    return pending;
  }, [business.slug]);

  useEffect(() => {
    const id = window.setInterval(() => {
      syncPendingDeals();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [syncPendingDeals]);

  useEffect(() => {
    const saved = localStorage.getItem(`linky-customer-${business.slug}`);
    if (saved) setCustomerName(saved);
    const savedPhone = localStorage.getItem(inquiryPhoneKey(business.slug));
    if (savedPhone) setOrderPhone(savedPhone);
    const prefs = loadCustomerPreferences(business.slug, ownerLocale);
    const hasPrefs =
      typeof window !== "undefined" &&
      !!localStorage.getItem(`linky-customer-prefs-${business.slug}`);
    setLocale(prefs.locale);
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

  useEffect(() => {
    if (isAppointments && mainTab === "deals") setMainTab("home");
  }, [isAppointments, mainTab]);

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

  const demoHistoryOrders = business.demoOrders?.history ?? [];
  const cartHasItems = cartLines.length > 0 || cartDeals.length > 0;
  const orderHistoryList = useMemo(() => {
    const seen = new Set<string>();
    const merged: CustomerOrderHistoryEntry[] = [];
    for (const order of [...localOrderHistory, ...demoHistoryOrders]) {
      if (seen.has(order.id)) continue;
      seen.add(order.id);
      merged.push(order);
    }
    return merged.sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
    );
  }, [localOrderHistory, demoHistoryOrders]);
  const activeProductLines = useMemo(
    (): OrderPreviewLine[] =>
      cartLines.map((l) => ({
        name: l.product.name,
        imageUrl: l.product.imageUrl,
        qty: l.qty,
        lineTotal: getEffectivePrice(l.product) * l.qty,
        productId: l.product.id,
      })),
    [cartLines]
  );

  const activeCartLines = useMemo((): OrderPreviewLine[] => {
    const dealLines = cartDeals.map((d) => ({
      name: d.name,
      imageUrl: d.products[0]?.imageUrl ?? null,
      qty: 1,
      lineTotal: d.dealPrice,
      dealId: d.id,
    }));
    return [...dealLines, ...activeProductLines];
  }, [cartDeals, activeProductLines]);

  const redeemedDealIds = useMemo(
    () => new Set(cartDeals.map((d) => d.id)),
    [cartDeals]
  );

  useEffect(() => {
    const prev = prevActiveOrderCountRef.current;
    if (activeOrderCount > prev && activeOrderCount > 0) {
      setActiveOrdersOpen(true);
    }
    prevActiveOrderCountRef.current = activeOrderCount;
  }, [activeOrderCount]);

  function reorderFromHistory(order: CustomerOrderHistoryEntry) {
    const nextCart: Record<string, number> = {};
    const nextDeals: StoreDeal[] = [];

    for (const line of order.lines) {
      if (line.dealId) {
        const deal =
          activeDeals.find((d) => d.id === line.dealId) ??
          (business.deals ?? []).find((d) => d.id === line.dealId);
        if (
          deal &&
          dealHasStock(deal) &&
          !nextDeals.some((d) => d.id === deal.id)
        ) {
          nextDeals.push(deal);
        }
        continue;
      }

      const product =
        (line.productId
          ? business.products.find((p) => p.id === line.productId)
          : undefined) ??
        business.products.find((p) => p.name === line.name);

      if (product && isProductInStock(product.stock)) {
        const maxQty = maxOrderQuantity(product.stock);
        nextCart[product.id] = Math.min(line.qty, maxQty);
      }
    }

    if (Object.keys(nextCart).length === 0 && nextDeals.length === 0) return;

    clearPendingDeals(business.slug);
    for (const deal of nextDeals) {
      addPendingDeal(business.slug, deal);
    }
    setCart(nextCart);
    setCartDeals(pendingDealsToSnapshots(loadPendingDeals(business.slug)));
    setHistoryDetailOrder(null);
    setActiveOrdersOpen(true);
    setMainTab("orders");
  }

  async function submitOrder(name: string, phone: string) {
    if (cartLines.length === 0 && cartDeals.length === 0) return;
    const orderSnapshot: CustomerOrderHistoryEntry = {
      id: `order-${Date.now()}`,
      placedAt: new Date().toISOString(),
      lines: activeCartLines,
      total: checkoutTotal,
      statusLabel: labels.pendingOrder,
    };
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
    removePendingDeals(
      business.slug,
      cartDeals.map((d) => d.id)
    );
    setCart({});
    setCartDeals([]);
    setOrderCheckoutOpen(false);
    setOrderSuccessOpen(true);
    const nextHistory = appendCustomerOrderHistory(business.slug, orderSnapshot);
    setLocalOrderHistory(nextHistory);
    setHistoryOrdersOpen(true);
    setActiveOrdersOpen(false);
  }

  function clearActiveCart() {
    clearPendingDeals(business.slug);
    setCart({});
    setCartDeals([]);
  }

  function addDealToActiveOrders(deal: StoreDeal) {
    if (!dealHasStock(deal)) return;
    if (redeemedDealIds.has(deal.id)) return;
    const next = addPendingDeal(business.slug, deal);
    setCartDeals(pendingDealsToSnapshots(next));
    setMainTab("orders");
    setActiveOrdersOpen(true);
  }

  const hasPendingInquiry = useMemo(
    () => myInquiries.some((inq) => !inq.sellerReply),
    [myInquiries]
  );

  async function sendInquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inquirySubmitting || inquirySubmitLockRef.current || hasPendingInquiry) {
      return;
    }

    inquirySubmitLockRef.current = true;
    setInquirySubmitting(true);
    setInquirySubmitError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const phone = String(fd.get("customerPhone") ?? "").trim();

    try {
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setInquirySubmitError(
          (data as { error?: string }).error ?? labels.inquirySubmitError
        );
        return;
      }

      const name = String(fd.get("customerName") ?? "").trim();
      if (name.length >= 2) {
        setCustomerName(name);
        localStorage.setItem(`linky-customer-${business.slug}`, name);
      }
      if (phone) {
        localStorage.setItem(inquiryPhoneKey(business.slug), phone);
        setOrderPhone(phone);
        await loadMyInquiries(phone);
      }
      form.reset();
      setInquirySuccessOpen(true);
    } catch {
      setInquirySubmitError(labels.inquirySubmitError);
    } finally {
      setInquirySubmitting(false);
      inquirySubmitLockRef.current = false;
    }
  }

  const myAppointments = useMemo(() => {
    const phone = normalizePhone(orderPhone);
    if (!phone) return localAppointments;
    return localAppointments.filter(
      (a) => normalizePhone(a.customerPhone) === phone
    );
  }, [localAppointments, orderPhone]);

  const activeAppointments = useMemo(
    () =>
      myAppointments.filter(
        (a) =>
          a.status !== "CANCELLED" && new Date(a.startAt).getTime() > Date.now()
      ),
    [myAppointments]
  );

  const pastAppointments = useMemo(
    () =>
      myAppointments.filter(
        (a) =>
          a.status === "CANCELLED" ||
          new Date(a.startAt).getTime() <= Date.now()
      ),
    [myAppointments]
  );

  async function submitAppointmentBooking(payload: {
    slotId: string;
    name: string;
    phone: string;
    serviceName: string;
    notes: string;
  }) {
    setBookingSubmitting(true);
    setBookingError("");
    const slot = business.slots.find((s) => s.id === payload.slotId);
    if (!slot) {
      setBookingError(labels.unavailable);
      setBookingSubmitting(false);
      return;
    }

    const phone = normalizePhone(payload.phone);
    const notes = buildAppointmentNotes(
      payload.serviceName,
      payload.notes,
      locale
    );

    try {
      let entry: CustomerAppointmentEntry;

      if (isDevAppointments) {
        entry = {
          id: `local-${Date.now()}`,
          slotId: payload.slotId,
          startAt: slot.startAt,
          endAt: slot.endAt,
          serviceName: payload.serviceName,
          customerName: payload.name.trim(),
          customerPhone: phone,
          notes,
          status: "CONFIRMED",
          bookedAt: new Date().toISOString(),
        };
      } else {
        const res = await fetch(`/api/public/${business.slug}/appointments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slotId: payload.slotId,
            customerName: payload.name,
            customerPhone: phone,
            serviceName: payload.serviceName,
            notes: payload.notes,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setBookingError(
            typeof data.error === "string" ? data.error : labels.unavailable
          );
          return;
        }
        entry = data.appointment as CustomerAppointmentEntry;
      }

      setCustomerName(payload.name.trim());
      setOrderPhone(phone);
      localStorage.setItem(`linky-customer-${business.slug}`, payload.name.trim());
      localStorage.setItem(inquiryPhoneKey(business.slug), phone);

      const next = appendCustomerAppointmentHistory(business.slug, entry);
      setLocalAppointments(next);
      setBookingModalOpen(false);
      setBookingDay(null);
      setBookingSlots([]);
      setAppointmentSuccessOpen(true);
      setMainTab("orders");
      setActiveOrdersOpen(true);
    } finally {
      setBookingSubmitting(false);
    }
  }

  async function cancelMyAppointment(appointmentId: string) {
    const appt = localAppointments.find((a) => a.id === appointmentId);
    if (!appt) return;
    if (
      !canCustomerCancelAppointment(
        appt.startAt,
        appointmentCancelPolicy,
        appt.status
      )
    ) {
      return;
    }

    if (!isDevAppointments) {
      const res = await fetch(`/api/public/${business.slug}/appointments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId,
          customerPhone: appt.customerPhone,
        }),
      });
      if (!res.ok) return;
    }

    const next = updateCustomerAppointmentHistory(business.slug, appointmentId, {
      status: "CANCELLED",
    });
    setLocalAppointments(next);
  }

  const futureSlots = business.slots.filter(
    (s) => new Date(s.startAt) > new Date()
  );

  const cartItemCount = activeOrderCount;

  const triggerProductConfetti = useCallback(() => {
    if (productConfettiTimeoutRef.current) {
      clearTimeout(productConfettiTimeoutRef.current);
    }
    setProductConfettiBurst((n) => n + 1);
    setProductConfettiActive(true);
    productConfettiTimeoutRef.current = setTimeout(() => {
      setProductConfettiActive(false);
      productConfettiTimeoutRef.current = null;
    }, PRODUCT_CONFETTI_MS);
  }, []);

  useEffect(
    () => () => {
      if (productConfettiTimeoutRef.current) {
        clearTimeout(productConfettiTimeoutRef.current);
      }
    },
    []
  );

  const incrementProductInCart = useCallback(
    (productId: string, maxQty: number) => {
      let added = false;
      setCart((c) => {
        const current = c[productId] ?? 0;
        if (current >= maxQty) return c;
        added = true;
        return { ...c, [productId]: current + 1 };
      });
      if (added) triggerProductConfetti();
    },
    [triggerProductConfetti]
  );

  const productCartHandlers = useMemo(() => {
    const map: Record<string, { onDec: () => void; onInc: () => void }> = {};
    for (const p of business.products) {
      const id = p.id;
      const maxQty = maxOrderQuantity(p.stock);
      map[id] = {
        onDec: () =>
          setCart((c) => ({
            ...c,
            [id]: Math.max(0, (c[id] ?? 0) - 1),
          })),
        onInc: () => incrementProductInCart(id, maxQty),
      };
    }
    return map;
  }, [business.products, incrementProductInCart]);

  function renderProductGrid() {
    if (business.products.length === 0) {
      return <EmptyStateCard message={labels.noServices} />;
    }
    return (
      <div className="grid min-w-0 grid-cols-2 items-stretch gap-2">
        {business.products.map((p) => {
          const outOfStock = !isProductInStock(p.stock);
          const maxQty = maxOrderQuantity(p.stock);
          const handlers = productCartHandlers[p.id];
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
              onDec={handlers?.onDec ?? (() => {})}
              onInc={handlers?.onInc ?? (() => {})}
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
      <div className="grid min-w-0 grid-cols-1 items-stretch justify-items-center gap-3">
        {activeDeals.map((d) => (
          <DealCard
            key={d.id}
            name={d.name}
            dealPrice={d.dealPrice}
            validUntil={d.validUntil}
            products={d.products}
            locale={locale}
            storeTheme={displayTheme}
            labels={labels}
            faded={redeemedDealIds.has(d.id)}
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
        return isAppointments ? (
          futureSlots.length === 0 ? (
            <div className="px-3 pt-3">
              <EmptyStateCard message={labels.noSlots} />
            </div>
          ) : (
            <div
              className={`grid min-h-0 flex-1 grid-rows-[minmax(0,10fr)_minmax(0,7fr)_auto] gap-2 overflow-hidden px-3 ${
                showSellerNoticeBanner ? "pt-2" : "pt-1"
              }`}
            >
              <div className="flex min-h-0 flex-col overflow-hidden">
                <CustomerAppointmentCalendar
                  slots={business.slots}
                  locale={locale}
                  labels={labels}
                  orderScheduleEnabled={business.orderScheduleEnabled ?? false}
                  orderSchedule={business.orderSchedule ?? null}
                  bookingByDay={business.appointmentBookingByDay ?? false}
                  highlightedDay={
                    dayViewOpen
                      ? dayViewKey
                      : bookingModalOpen
                        ? bookingDay
                        : null
                  }
                  homeLayout
                  onDayOpen={(dateKey, daySlots) => {
                    setDayViewKey(dateKey);
                    setDayViewSlots(daySlots);
                    setDayViewOpen(true);
                  }}
                />
              </div>
              <CustomerAppointmentOpenSlotsPanel
                slots={business.slots}
                locale={locale}
                labels={labels}
                bookingByDay={business.appointmentBookingByDay ?? false}
                onSelect={(dateKey, openSlots) => {
                  setBookingDay(dateKey);
                  setBookingSlots(openSlots);
                  setBookingError("");
                  setBookingModalOpen(true);
                }}
              />
              <div className="shrink-0 pb-2">
                <CustomerAppointmentReminderRow
                  businessSlug={business.slug}
                  slots={business.slots}
                  labels={labels}
                  customerPhone={orderPhone}
                  onNeedPhone={() => setProfileModalOpen(true)}
                />
              </div>
            </div>
          )
        ) : (
          <div className="space-y-4 p-1 pb-2">
            {renderProductGrid()}
          </div>
        );

      case "orders":
        return (
          <div className="space-y-4 pb-2">
            {isAppointments ? (
              <div className="bakery-float-panel space-y-2 rounded-[24px] p-3">
                <SettingsCollapsibleSection
                  title={labels.myAppointments}
                  icon={Receipt}
                  expanded={activeOrdersOpen}
                  onToggle={() => setActiveOrdersOpen((open) => !open)}
                >
                  {activeAppointments.length === 0 ? (
                    <HubEmptyText>{labels.noActiveAppts}</HubEmptyText>
                  ) : (
                    <ul className="space-y-2">
                      {activeAppointments.map((appt) => (
                        <li key={appt.id}>
                          <AppointmentPreviewCard
                            serviceName={appt.serviceName}
                            startAt={appt.startAt}
                            status={appt.status}
                            locale={locale}
                            labels={labels}
                            canCancel={canCustomerCancelAppointment(
                              appt.startAt,
                              appointmentCancelPolicy,
                              appt.status
                            )}
                            onCancel={() => void cancelMyAppointment(appt.id)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </SettingsCollapsibleSection>
                <SettingsCollapsibleSection
                  title={labels.appointmentHistory}
                  icon={History}
                  expanded={historyOrdersOpen}
                  onToggle={() => setHistoryOrdersOpen((open) => !open)}
                >
                  {pastAppointments.length === 0 ? (
                    <HubEmptyText>{labels.noMyAppts}</HubEmptyText>
                  ) : (
                    <ul className="space-y-2">
                      {pastAppointments.map((appt) => (
                        <li key={appt.id}>
                          <AppointmentPreviewCard
                            serviceName={appt.serviceName}
                            startAt={appt.startAt}
                            status={appt.status}
                            locale={locale}
                            labels={labels}
                            canCancel={false}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </SettingsCollapsibleSection>
              </div>
            ) : (
              <div className="bakery-float-panel space-y-2 rounded-[24px] p-3">
                <SettingsCollapsibleSection
                  title={labels.activeOrders}
                  icon={Receipt}
                  expanded={activeOrdersOpen}
                  onToggle={() => setActiveOrdersOpen((open) => !open)}
                >
                  {!cartHasItems ? (
                    <HubEmptyText>{labels.cartEmpty}</HubEmptyText>
                  ) : (
                    <OrderPreviewCard
                      lines={activeCartLines}
                      locale={locale}
                      confirmLabel={labels.confirmOrder}
                      cancelLabel={labels.cancelOrder}
                      onConfirm={() => {
                        setOrderError("");
                        setOrderCheckoutOpen(true);
                      }}
                      onCancel={clearActiveCart}
                    />
                  )}
                </SettingsCollapsibleSection>
                <SettingsCollapsibleSection
                  title={labels.orderHistory}
                  icon={History}
                  expanded={historyOrdersOpen}
                  onToggle={() => setHistoryOrdersOpen((open) => !open)}
                >
                  {orderHistoryList.length === 0 ? (
                    <HubEmptyText>{labels.noPastOrders}</HubEmptyText>
                  ) : (
                    <ul className="space-y-2">
                      {orderHistoryList.map((order) => (
                        <li key={order.id}>
                          <OrderHistorySummaryRow
                            placedAt={order.placedAt}
                            total={order.total}
                            locale={locale}
                            onClick={() => setHistoryDetailOrder(order)}
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                </SettingsCollapsibleSection>
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
              <div className="p-1">
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
                <SettingsMenuSubRow
                  icon={UserRound}
                  title={labels.signIn}
                  onClick={() => setProfileModalOpen(true)}
                />
                <SettingsMenuSubRow
                  icon={SlidersHorizontal}
                  title={labels.language}
                  onClick={() => setDisplayOpen(true)}
                />
                <SettingsMenuSubRow
                  icon={ShieldPlus}
                  title={labels.legal}
                  onClick={() => setLegalOpen(true)}
                />
                <SettingsMenuSubRow
                  icon={Smartphone}
                  title={labels.installApp}
                  onClick={() => setInstallAppOpen(true)}
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
      <DashboardConfettiBackground
        key={productConfettiBurst}
        active={productConfettiActive}
      />
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
          <main
            className={
              isAppointments && mainTab === "home" && !unavailable
                ? CUSTOMER_SCROLL_MAIN_APPOINTMENTS_HOME
                : CUSTOMER_SCROLL_MAIN
            }
          >
            {renderMainContent()}
          </main>
        </div>
      </div>

      {!unavailable && (
        <CustomerStoreTabNav
          labels={labels}
          active={mainTab}
          onSelect={setMainTab}
          ordersBadge={isAppointments ? undefined : cartItemCount}
          hideDeals={isAppointments}
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
        platformLegalDocs={platformLegalDocs}
      />

      <CustomerInstallAppSheet
        open={installAppOpen}
        onClose={() => setInstallAppOpen(false)}
        locale={locale}
        storeTheme={displayTheme}
        copy={{
          title: labels.installApp,
          panelTitle: labels.installAppPanelTitle,
          installedTitle: labels.installAppInstalledTitle,
          installedHint: labels.installAppInstalledHint,
          installButton: labels.installAppButton,
          iosStep1: labels.installAppIosStep1,
          iosStep2: labels.installAppIosStep2,
          iosStep3: labels.installAppIosStep3,
          androidHint: labels.installAppAndroidHint,
          desktopHint: labels.installAppDesktopHint,
        }}
      />

      {contactModalOpen && (
      <CustomerContactModal
        open
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
        inquirySubmitting={inquirySubmitting}
        inquirySubmitError={inquirySubmitError}
        hasPendingInquiry={hasPendingInquiry}
        onSubmitInquiry={sendInquiry}
      />
      )}

      <CustomerCenterModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        locale={locale}
        storeTheme={displayTheme}
        title={labels.signIn}
        panelClassName="customer-profile-modal-panel max-h-fit"
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
        onClose={() => {
          setOrderCheckoutOpen(false);
          setOrderError("");
        }}
        locale={locale}
        storeTheme={displayTheme}
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

      {orderSuccessOpen && (
      <CelebrationModal
        open
        onClose={() => setOrderSuccessOpen(false)}
        title={labels.orderSuccessTitle}
        detail={labels.orderSuccessDetail}
        buttonLabel={labels.great}
        closeAriaLabel={labels.close}
      />
      )}

      {appointmentSuccessOpen && (
        <CelebrationModal
          open
          onClose={() => setAppointmentSuccessOpen(false)}
          title={labels.appointmentBookedTitle}
          detail={labels.appointmentBookedDetail}
          buttonLabel={labels.great}
          closeAriaLabel={labels.close}
        />
      )}

      <CustomerAppointmentDayModal
        open={dayViewOpen}
        onClose={() => {
          setDayViewOpen(false);
          setDayViewKey(null);
          setDayViewSlots([]);
        }}
        dateKey={dayViewKey}
        slots={dayViewSlots}
        locale={locale}
        labels={labels}
        orderScheduleEnabled={business.orderScheduleEnabled ?? false}
        orderSchedule={business.orderSchedule ?? null}
        bookingByDay={business.appointmentBookingByDay ?? false}
        onBook={(dateKey, slotsForBooking) => {
          setBookingDay(dateKey);
          setBookingSlots(slotsForBooking);
          setBookingError("");
          setBookingModalOpen(true);
        }}
      />

      <CustomerAppointmentBookingModal
        open={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setBookingDay(null);
          setBookingSlots([]);
          setBookingError("");
        }}
        dateKey={bookingDay}
        slots={bookingSlots}
        services={business.products.map((p) => ({ id: p.id, name: p.name }))}
        bookingByDay={business.appointmentBookingByDay ?? false}
        locale={locale}
        labels={labels}
        storeTheme={displayTheme}
        initialName={customerName}
        initialPhone={orderPhone}
        submitting={bookingSubmitting}
        error={bookingError}
        onSubmit={submitAppointmentBooking}
      />

      <CustomerCenterModal
        open={historyDetailOrder !== null}
        onClose={() => setHistoryDetailOrder(null)}
        title={labels.orderDetails}
        locale={locale}
        storeTheme={displayTheme}
        ariaLabel={labels.orderDetails}
        panelClassName="customer-order-detail-modal-panel"
        bodyClassName="px-3 py-4"
      >
        {historyDetailOrder ? (
          <div className="space-y-4">
            <OrderPreviewCard
              lines={historyDetailOrder.lines}
              locale={locale}
            />
            <Button
              type="button"
              className="w-full font-extrabold"
              onClick={() => reorderFromHistory(historyDetailOrder)}
            >
              {labels.orderAgain}
            </Button>
          </div>
        ) : null}
      </CustomerCenterModal>

      <CelebrationModal
        open={inquirySuccessOpen}
        onClose={() => setInquirySuccessOpen(false)}
        title={labels.inquirySentTitle}
        detail={labels.inquirySentDetail}
        buttonLabel={labels.sellerNoticeGotIt}
        closeAriaLabel={locale === "he" ? "סגור" : "Close"}
      />
    </div>
  );
}
