"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  HelpCircle,
  MessagesSquare,
  Receipt,
  SlidersHorizontal,
  ShieldPlus,
  UserRound,
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
import { CustomerCookieConsent } from "./customer-cookie-consent";
import { OrderCheckoutModal } from "./order-checkout-modal";
import { CustomerCartCheckoutBar } from "./customer-cart-checkout-bar";
import { cn } from "@/lib/utils";
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
  type PendingDealSnapshot,
} from "@/lib/customer-pending-deals";
import {
  incrementLocalDealRedemptionCounts,
  loadLocalDealRedemptionCounts,
  mergeDealRedemptionCounts,
} from "@/lib/customer-deal-redemptions";
import { isDealRedemptionLimitReached } from "@/lib/store-deal-redemption";
import {
  bootstrapDealsSeenIfNeeded,
  countUnseenDeals,
  maxDealCreatedAt,
  saveDealsLastSeenAt,
} from "@/lib/customer-deals-seen";
import type { PublicStoreDeal } from "@/lib/public-deals";
import { useVisibilityInterval } from "@/hooks/use-visibility-interval";
import {
  appendCustomerOrderHistory,
  formatCustomerOrderNumbers,
  loadCustomerOrderHistory,
  type CustomerOrderHistoryEntry,
} from "@/lib/customer-order-history";
import { CustomerSellerNoticeBanner } from "./customer-seller-notice-banner";
import {
  buildSellerWhatsAppHref,
  CustomerWhatsAppContactRow,
} from "./customer-whatsapp-contact-row";
import {
  DEFAULT_STORE_PANELS_VISIBLE,
  isSellerWhatsAppVisible,
  type StorePanelsVisible,
} from "@/lib/store-panels-visible";
import type { AppointmentSlot } from "./customer-appointment-calendar";
import {
  CustomerAppointmentsHomeShell,
} from "./customer-appointments-home-backdrop";
import { CustomerAppointmentsHomeCalendar } from "./customer-appointments-home-calendar";
import { CustomerAppointmentBookingModal } from "./customer-appointment-booking-modal";
import { CustomerAppointmentDetailModal } from "./customer-appointment-detail-modal";
import { CustomerRentalBookingModal } from "./customer-rental-booking-modal";
import { buildRentalNotes, isoAtLocalTime } from "@/lib/rental-period";
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
import { CustomerPhoneVerification } from "./customer-phone-verification";
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
  CUSTOMER_SCROLL_MAIN_WITH_CHECKOUT,
  CUSTOMER_PHONE_COLUMN,
  CUSTOMER_PHONE_DESKTOP_BACKDROP,
  CUSTOMER_SCROLL_MAIN_APPOINTMENTS_HOME,
  CUSTOMER_VIEWPORT_HEIGHT,
} from "./customer-store-frame";
import { isValidPhone, normalizePhone, parseIsraeliMobilePhone } from "@/lib/phone";
import { DEV_PREVIEW_INQUIRIES } from "@/lib/dev-preview-data";
import type { CustomerResolution } from "@/lib/customer-resolution";
import { updateDevStoreChatResolution } from "@/lib/customer-chat-storage";
import { isWithinCustomerHistoryWindow } from "@/lib/customer-history-access";
import {
  customerInquiryPhoneKey,
  customerNameKey,
  getCustomerDeviceItem,
  initCustomerDeviceStorage,
  setCustomerDeviceItem,
} from "@/lib/customer-device-storage";

type MyInquiry = {
  id: string;
  subject?: string;
  message: string;
  sellerReply: string | null;
  sellerReplyAt: string | null;
  customerResolution?: string | null;
  customerResolutionAt?: string | null;
  createdAt: string;
};

function inquiryResolutionKey(slug: string) {
  return `linky-inquiry-resolution-${slug}`;
}

function loadDevInquiryResolutions(
  slug: string
): Record<string, { resolution: CustomerResolution; at: string }> {
  if (typeof window === "undefined") return {};
  try {
    const raw = getCustomerDeviceItem(inquiryResolutionKey(slug));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<
      string,
      { resolution: CustomerResolution; at: string }
    >;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveDevInquiryResolution(
  slug: string,
  inquiryId: string,
  resolution: CustomerResolution
) {
  const existing = loadDevInquiryResolutions(slug);
  existing[inquiryId] = {
    resolution,
    at: new Date().toISOString(),
  };
  setCustomerDeviceItem(inquiryResolutionKey(slug), JSON.stringify(existing));
}

function broadcastSeenKey(slug: string) {
  return `linky-broadcast-seen-${slug}`;
}

function inquiryPhoneKey(slug: string) {
  return customerInquiryPhoneKey(slug);
}

type SellerNoticeState = {
  message: string;
  sentAt: string | null;
  unread: boolean;
};

function resolveSellerNoticeFromProps(
  storeBroadcast: string | null | undefined,
  storeBroadcastAt: string | null | undefined,
  broadcastEnabled: boolean
): SellerNoticeState {
  const empty: SellerNoticeState = { message: "", sentAt: null, unread: false };
  if (!broadcastEnabled) return empty;

  const message = storeBroadcast?.trim() ?? "";
  const sentAt = storeBroadcastAt ?? null;
  if (!message || !sentAt) return empty;

  return { message, sentAt, unread: true };
}

function resolveSellerNoticeState(
  slug: string,
  storeBroadcast: string | null | undefined,
  storeBroadcastAt: string | null | undefined,
  broadcastEnabled: boolean
): SellerNoticeState {
  const empty: SellerNoticeState = { message: "", sentAt: null, unread: false };
  if (!broadcastEnabled) return empty;

  const message = storeBroadcast?.trim() ?? "";
  const sentAt = storeBroadcastAt ?? null;
  if (!message || !sentAt) return empty;

  if (typeof window !== "undefined") {
    const seen = getCustomerDeviceItem(broadcastSeenKey(slug));
    if (seen === sentAt) return empty;
  }

  return { message, sentAt, unread: true };
}

function resolveInitialDisplayPreferences(
  slug: string,
  ownerLocale: CustomerLocale,
  ownerTheme: CustomerDisplayTheme
) {
  const prefs = loadCustomerPreferences(slug, ownerLocale);
  const hasSavedPrefs =
    typeof window !== "undefined" &&
    !!getCustomerDeviceItem(`linky-customer-prefs-${slug}`);
  return {
    locale: prefs.locale,
    textScale: prefs.textScale,
    theme: hasSavedPrefs ? prefs.theme : ownerTheme,
  };
}

type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  imageUrls?: string[];
  price: number;
  salePrice?: number | null;
  stock?: number | null;
};

type StoreDeal = PublicStoreDeal;

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
  orderNumber?: number;
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
    storePanelsVisible?: StorePanelsVisible;
    sellerContactPhone?: string | null;
    demoOrders?: {
      active: DemoOrderPreview[];
      history: DemoOrderPreview[];
    };
  };
  unavailable: boolean;
  platformLegalDocs?: PlatformLegalDocPayload[];
}) {
  const isRental = business.type === "RENTAL";
  const isAppointments = business.type === "APPOINTMENTS";
  const isScheduleLike = isAppointments || isRental;
  const isDevAppointments = business.slug === "demo-appointments";
  const isDevRental = business.slug === "demo-rental";
  const isDevSchedule = isDevAppointments || isDevRental;
  const panels = business.storePanelsVisible ?? DEFAULT_STORE_PANELS_VISIBLE;
  const showWhatsAppContact = isSellerWhatsAppVisible(
    panels,
    business.sellerContactPhone
  );
  const ownerTheme = parseStoreTheme(business.storeTheme);
  const ownerLocale: CustomerLocale =
    business.storeLocale === "en" ? "en" : "he";
  const effectiveOrderScheduleEnabled =
    panels.orderLimits && (business.orderScheduleEnabled ?? false);
  const showContactSeller =
    showWhatsAppContact || panels.inquiries;
  const appointmentCancelPolicy = parseAppointmentCancelPolicy(
    business.storeTerms
  );
  const [mainTab, setMainTab] = useState<CustomerMainTab>("home");
  const [liveDeals, setLiveDeals] = useState<StoreDeal[]>(business.deals ?? []);
  const [dealsLastSeenAt, setDealsLastSeenAt] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactView, setContactView] = useState<ContactView>("menu");
  const [contactDirectEntry, setContactDirectEntry] = useState(false);
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
  const [cartDeals, setCartDeals] = useState<PendingDealSnapshot[]>([]);
  const [dealRedemptionCounts, setDealRedemptionCounts] = useState<
    Record<string, number>
  >({});
  const [orderCheckoutOpen, setOrderCheckoutOpen] = useState(false);
  const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);
  const [activeOrdersOpen, setActiveOrdersOpen] = useState(false);
  const [localOrderHistory, setLocalOrderHistory] = useState<
    CustomerOrderHistoryEntry[]
  >([]);
  const [historyDetailOrder, setHistoryDetailOrder] =
    useState<CustomerOrderHistoryEntry | null>(null);
  const prevActiveOrderCountRef = useRef(0);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const propsSellerNotice = resolveSellerNoticeFromProps(
    business.storeBroadcast,
    business.storeBroadcastAt,
    panels.broadcast
  );
  const [sellerNoticeUnread, setSellerNoticeUnread] = useState(
    propsSellerNotice.unread
  );
  const [sellerNoticeExpanded, setSellerNoticeExpanded] = useState(false);
  const [sellerNoticeMessage, setSellerNoticeMessage] = useState(
    propsSellerNotice.message
  );
  const [sellerNoticeSentAt, setSellerNoticeSentAt] = useState<string | null>(
    propsSellerNotice.sentAt
  );
  const [myInquiries, setMyInquiries] = useState<MyInquiry[]>([]);
  const [inquiryPhoneVerifyRequired, setInquiryPhoneVerifyRequired] =
    useState(false);
  const [phoneVerifyPrompt, setPhoneVerifyPrompt] = useState<string | null>(null);
  const [pendingCancelAppointmentId, setPendingCancelAppointmentId] = useState<
    string | null
  >(null);
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySubmitError, setInquirySubmitError] = useState("");
  const [inquirySuccessOpen, setInquirySuccessOpen] = useState(false);
  const inquirySubmitLockRef = useRef(false);
  const [localAppointments, setLocalAppointments] = useState<
    CustomerAppointmentEntry[]
  >([]);
  const [detailAppointmentId, setDetailAppointmentId] = useState<string | null>(
    null
  );
  const [cancellingAppointment, setCancellingAppointment] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDay, setBookingDay] = useState<string | null>(null);
  const [bookingSlots, setBookingSlots] = useState<AppointmentSlot[]>([]);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [appointmentSuccessOpen, setAppointmentSuccessOpen] = useState(false);
  const [locale, setLocale] = useState<CustomerLocale>(ownerLocale);
  const [displayTheme, setDisplayTheme] =
    useState<CustomerDisplayTheme>(ownerTheme);
  const [textScale, setTextScale] = useState<CustomerTextScale>("100");

  const labels = useMemo(() => getCustomerLabels(locale), [locale]);

  const sellerWhatsAppHref = useMemo(
    () =>
      showWhatsAppContact
        ? buildSellerWhatsAppHref(
            business.sellerContactPhone,
            business.name,
            locale
          )
        : null,
    [showWhatsAppContact, business.sellerContactPhone, business.name, locale]
  );

  useEffect(() => {
    void initCustomerDeviceStorage();
  }, []);

  useEffect(() => {
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const refreshDealRedemptionCounts = useCallback(
    async (phone?: string) => {
      const local = loadLocalDealRedemptionCounts(business.slug);
      const normalizedPhone = phone?.trim();
      if (!normalizedPhone) {
        setDealRedemptionCounts(local);
        return;
      }
      try {
        const res = await fetch(
          `/api/public/${business.slug}/deal-redemptions?phone=${encodeURIComponent(normalizedPhone)}`
        );
        if (!res.ok) {
          setDealRedemptionCounts(local);
          return;
        }
        const data = (await res.json()) as { counts?: Record<string, number> };
        setDealRedemptionCounts(
          mergeDealRedemptionCounts(local, data.counts ?? {})
        );
      } catch {
        setDealRedemptionCounts(local);
      }
    },
    [business.slug]
  );

  useEffect(() => {
    setLocalOrderHistory(loadCustomerOrderHistory(business.slug));
    setCartDeals(pendingDealsToSnapshots(loadPendingDeals(business.slug)));
    setLocalAppointments(loadCustomerAppointmentHistory(business.slug));

    const notice = resolveSellerNoticeState(
      business.slug,
      business.storeBroadcast,
      business.storeBroadcastAt,
      panels.broadcast
    );
    setSellerNoticeMessage(notice.message);
    setSellerNoticeSentAt(notice.sentAt);
    setSellerNoticeUnread(notice.unread);
    setSellerNoticeExpanded(false);

    const prefs = resolveInitialDisplayPreferences(
      business.slug,
      ownerLocale,
      ownerTheme
    );
    setLocale(prefs.locale);
    setTextScale(prefs.textScale);
    setDisplayTheme(prefs.theme);

    const savedPhone =
      typeof window !== "undefined"
        ? getCustomerDeviceItem(inquiryPhoneKey(business.slug))
        : null;
    void refreshDealRedemptionCounts(savedPhone ?? undefined);
  }, [
    business.slug,
    business.storeBroadcast,
    business.storeBroadcastAt,
    ownerLocale,
    ownerTheme,
    panels.broadcast,
    refreshDealRedemptionCounts,
  ]);

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
    const saved = getCustomerDeviceItem(customerNameKey(business.slug));
    if (saved) setCustomerName(saved);
    const savedPhone = getCustomerDeviceItem(inquiryPhoneKey(business.slug));
    if (savedPhone) {
      setOrderPhone(savedPhone);
      void refreshDealRedemptionCounts(savedPhone);
    }
  }, [business.slug, refreshDealRedemptionCounts]);

  useEffect(() => {
    if (!profileModalOpen) return;
    setProfileDraftName(customerName);
    setProfileDraftPhone(orderPhone);
    setProfileSavedFlash(false);
  }, [profileModalOpen, customerName, orderPhone]);

  const [profilePhoneError, setProfilePhoneError] = useState("");

  function saveCustomerProfile() {
    const name = profileDraftName.trim();
    if (name.length < 2) return;
    const phone = profileDraftPhone.trim();
    if (phone && !isValidPhone(phone)) {
      setProfilePhoneError(labels.invalidPhone);
      return;
    }
    setProfilePhoneError("");
    setCustomerName(name);
    setOrderPhone(phone);
    setCustomerDeviceItem(customerNameKey(business.slug), name);
    setCustomerDeviceItem(inquiryPhoneKey(business.slug), phone);
    if (phone) void loadMyInquiries(phone);
    setProfileSavedFlash(true);
    window.setTimeout(() => {
      setProfileModalOpen(false);
      setProfileSavedFlash(false);
    }, 700);
  }

  useEffect(() => {
    if (unavailable || !panels.broadcast) return;
    if (business.storeBroadcast?.trim() && business.storeBroadcastAt) return;

    let cancelled = false;

    async function fetchBroadcast() {
      try {
        const res = await fetch(`/api/public/${business.slug}/broadcast`);
        const data = await res.json();
        if (cancelled || !res.ok || !data.message) return;

        const notice = resolveSellerNoticeState(
          business.slug,
          data.message as string,
          (data.sentAt as string | null) ?? null,
          true
        );
        setSellerNoticeMessage(notice.message);
        setSellerNoticeSentAt(notice.sentAt);
        setSellerNoticeUnread(notice.unread);
        setSellerNoticeExpanded(false);
      } catch {
        // keep initial state
      }
    }

    void fetchBroadcast();
    return () => {
      cancelled = true;
    };
  }, [business.slug, business.storeBroadcast, business.storeBroadcastAt, unavailable, panels.broadcast]);

  const loadMyInquiries = useCallback(
    async (phoneRaw: string) => {
      const phone = parseIsraeliMobilePhone(phoneRaw);
      if (!phone) {
        setMyInquiries([]);
        return;
      }

      if (business.slug === "demo-store") {
        const devResolutions = loadDevInquiryResolutions(business.slug);
        const matched = DEV_PREVIEW_INQUIRIES.filter(
          (row) =>
            row.customerPhone &&
            normalizePhone(row.customerPhone) === phone
        ).map((row) => {
          const saved = devResolutions[row.id];
          return {
            id: row.id,
            subject: row.subject,
            message: row.message,
            sellerReply: row.sellerReply,
            sellerReplyAt: row.sellerReplyAt,
            customerResolution: saved?.resolution ?? null,
            customerResolutionAt: saved?.at ?? null,
            createdAt: row.createdAt,
          };
        });
        setMyInquiries(matched);
        return;
      }

      try {
        const res = await fetch(
          `/api/public/${business.slug}/inquiry-updates?phone=${encodeURIComponent(phoneRaw)}`,
          { credentials: "include" }
        );
        const data = (await res.json()) as {
          inquiries?: MyInquiry[];
          code?: string;
        };
        if (res.status === 403 && data.code === "PHONE_VERIFICATION_REQUIRED") {
          setInquiryPhoneVerifyRequired(true);
          setMyInquiries([]);
          return;
        }
        setInquiryPhoneVerifyRequired(false);
        if (res.ok) setMyInquiries(data.inquiries ?? []);
      } catch {
        setMyInquiries([]);
      }
    },
    [business.slug]
  );

  useEffect(() => {
    if (unavailable) return;
    const stored = getCustomerDeviceItem(inquiryPhoneKey(business.slug));
    const phone = orderPhone || stored || "";
    if (phone) loadMyInquiries(phone);
  }, [orderPhone, business.slug, unavailable, loadMyInquiries]);

  function dismissSellerNotice() {
    const sentAt = sellerNoticeSentAt ?? business.storeBroadcastAt;
    if (sentAt) {
      setCustomerDeviceItem(broadcastSeenKey(business.slug), sentAt);
    }
    setSellerNoticeMessage("");
    setSellerNoticeSentAt(null);
    setSellerNoticeUnread(false);
    setSellerNoticeExpanded(false);
  }

  function openSellerNotice() {
    setSellerNoticeExpanded(true);
    setSellerNoticeUnread(false);
  }

  function closeSellerNoticeModal() {
    setSellerNoticeExpanded(false);
  }

  const showSellerNoticeBanner =
    panels.broadcast &&
    mainTab === "home" &&
    sellerNoticeMessage.trim().length > 0;

  useEffect(() => {
    if (mainTab !== "home") {
      setSellerNoticeExpanded(false);
    }
  }, [mainTab]);

  useEffect(() => {
    if ((isScheduleLike || !panels.deals) && mainTab === "deals") {
      setMainTab("home");
    }
  }, [isScheduleLike, panels.deals, mainTab]);

  useEffect(() => {
    if (mainTab === "orders") {
      setMainTab("home");
    }
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

  const dealsSeenBootstrappedRef = useRef(false);

  useEffect(() => {
    setLiveDeals(business.deals ?? []);
  }, [business.deals]);

  useEffect(() => {
    if (unavailable || !panels.deals || isScheduleLike) return;
    if (dealsSeenBootstrappedRef.current) return;
    const seen = bootstrapDealsSeenIfNeeded(
      business.slug,
      business.deals ?? []
    );
    setDealsLastSeenAt(seen);
    dealsSeenBootstrappedRef.current = true;
  }, [business.slug, business.deals, unavailable, panels.deals, isScheduleLike]);

  const refreshLiveDeals = useCallback(async () => {
    if (unavailable || !panels.deals || isScheduleLike) return;
    if (business.slug === "demo-store") return;
    try {
      const res = await fetch(`/api/public/${business.slug}/deals`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.deals)) {
        setLiveDeals(data.deals as StoreDeal[]);
      }
    } catch {
      // keep cached deals
    }
  }, [business.slug, unavailable, panels.deals, isScheduleLike]);

  useVisibilityInterval(
    () => void refreshLiveDeals(),
    45_000,
    120_000,
    !unavailable && panels.deals && !isScheduleLike
  );

  const markDealsSeen = useCallback(() => {
    const latest = maxDealCreatedAt(liveDeals);
    const stamp = latest ?? new Date().toISOString();
    saveDealsLastSeenAt(business.slug, stamp);
    setDealsLastSeenAt(stamp);
  }, [business.slug, liveDeals]);

  const selectMainTab = useCallback(
    (tab: CustomerMainTab) => {
      if (tab === "orders") return;
      if (tab === "deals") markDealsSeen();
      setMainTab(tab);
    },
    [markDealsSeen]
  );

  const activeDeals = useMemo(() => {
    const now = Date.now();
    return liveDeals.filter((d) => new Date(d.validUntil).getTime() > now);
  }, [liveDeals]);

  const dealsBadge = useMemo(() => {
    if (!panels.deals || isScheduleLike) return 0;
    return countUnseenDeals(activeDeals, dealsLastSeenAt);
  }, [activeDeals, dealsLastSeenAt, panels.deals, isScheduleLike]);

  const dealsInCartIds = useMemo(
    () => new Set(cartDeals.map((d) => d.id)),
    [cartDeals]
  );

  const visibleDeals = useMemo(() => {
    return activeDeals.filter((d) => {
      const max = d.maxRedemptionsPerCustomer ?? 1;
      const exhausted = isDealRedemptionLimitReached(
        max,
        dealRedemptionCounts[d.id] ?? 0
      );
      return !exhausted || dealsInCartIds.has(d.id);
    });
  }, [activeDeals, dealRedemptionCounts, dealsInCartIds]);

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
  const visibleOrderHistory = useMemo(
    () =>
      orderHistoryList.filter((order) =>
        isWithinCustomerHistoryWindow(order.placedAt)
      ),
    [orderHistoryList]
  );
  const orderHistorySuspended =
    orderHistoryList.length > 0 && visibleOrderHistory.length === 0;
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
        const max = deal?.maxRedemptionsPerCustomer ?? 1;
        if (
          deal &&
          dealHasStock(deal) &&
          !isDealRedemptionLimitReached(
            max,
            dealRedemptionCounts[deal.id] ?? 0
          ) &&
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
    if (isScheduleLike) {
      setActiveOrdersOpen(true);
      setMainTab("settings");
    }
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
    if (!isValidPhone(phone)) {
      setOrderError(labels.invalidPhone);
      return;
    }
    setOrderError("");
    setOrderSubmitting(true);

    const payloadBase = {
      customerName: name,
      customerPhone: phone,
    };
    const placedOrderNumbers: number[] = [];

    for (const deal of cartDeals) {
      const res = await fetch(`/api/public/${business.slug}/orders`, {
        method: "POST",
        credentials: "include",
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
      const data = (await res.json().catch(() => ({}))) as {
        orderNumber?: number;
      };
      if (typeof data.orderNumber === "number") {
        placedOrderNumbers.push(data.orderNumber);
      }
    }

    if (cartLines.length > 0) {
      const res = await fetch(`/api/public/${business.slug}/orders`, {
        method: "POST",
        credentials: "include",
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
      const data = (await res.json().catch(() => ({}))) as {
        orderNumber?: number;
      };
      if (typeof data.orderNumber === "number") {
        placedOrderNumbers.push(data.orderNumber);
      }
    } else {
      setOrderSubmitting(false);
    }

    orderSnapshot.orderNumbers =
      placedOrderNumbers.length > 0 ? placedOrderNumbers : undefined;
    orderSnapshot.orderNumber = placedOrderNumbers[0];

    setCustomerName(name);
    setOrderPhone(phone);
    setCustomerDeviceItem(customerNameKey(business.slug), name);
    setCustomerDeviceItem(inquiryPhoneKey(business.slug), phone);
    const redeemedDealIds = cartDeals.map((d) => d.id);
    removePendingDeals(business.slug, redeemedDealIds);
    const nextCounts = incrementLocalDealRedemptionCounts(
      business.slug,
      redeemedDealIds
    );
    setDealRedemptionCounts((prev) =>
      mergeDealRedemptionCounts(prev, nextCounts)
    );
    void refreshDealRedemptionCounts(phone);
    setCart({});
    setCartDeals([]);
    setOrderCheckoutOpen(false);
    setOrderSuccessOpen(true);
    const nextHistory = appendCustomerOrderHistory(business.slug, orderSnapshot);
    setLocalOrderHistory(nextHistory);
    setActiveOrdersOpen(false);
  }

  function clearActiveCart() {
    clearPendingDeals(business.slug);
    setCart({});
    setCartDeals([]);
  }

  function addDealToActiveOrders(deal: StoreDeal) {
    if (!dealHasStock(deal)) return;
    if (dealsInCartIds.has(deal.id)) return;
    const max = deal.maxRedemptionsPerCustomer ?? 1;
    if (
      isDealRedemptionLimitReached(max, dealRedemptionCounts[deal.id] ?? 0)
    ) {
      return;
    }
    const next = addPendingDeal(business.slug, deal);
    setCartDeals(pendingDealsToSnapshots(next));
  }

  const hasPendingInquiry = useMemo(
    () => myInquiries.some((inq) => !inq.sellerReply),
    [myInquiries]
  );

  async function submitInquiryResolution(
    inquiryId: string,
    resolution: CustomerResolution
  ) {
    const phoneRaw =
      orderPhone ||
      (typeof window !== "undefined"
        ? getCustomerDeviceItem(inquiryPhoneKey(business.slug))
        : null) ||
      "";
    const phone = parseIsraeliMobilePhone(phoneRaw);
    if (!phone) return;

    if (business.slug === "demo-store") {
      saveDevInquiryResolution(business.slug, inquiryId, resolution);
      setMyInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inquiryId
            ? {
                ...inq,
                customerResolution: resolution,
                customerResolutionAt: new Date().toISOString(),
              }
            : inq
        )
      );
      return;
    }

    const res = await fetch(
      `/api/public/${business.slug}/inquiries/${inquiryId}/resolution`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerPhone: phone, resolution }),
      }
    );
    if (!res.ok) throw new Error("resolution failed");
    const data = (await res.json()) as {
      inquiry?: {
        customerResolution?: string | null;
        customerResolutionAt?: string | null;
      };
    };
    setMyInquiries((prev) =>
      prev.map((inq) =>
        inq.id === inquiryId
          ? {
              ...inq,
              customerResolution:
                data.inquiry?.customerResolution ?? resolution,
              customerResolutionAt:
                data.inquiry?.customerResolutionAt ?? new Date().toISOString(),
            }
          : inq
      )
    );
  }

  async function submitChatResolution(
    messageId: string,
    resolution: CustomerResolution
  ) {
    const phoneRaw =
      orderPhone ||
      (typeof window !== "undefined"
        ? getCustomerDeviceItem(inquiryPhoneKey(business.slug))
        : null) ||
      "";
    const phone = parseIsraeliMobilePhone(phoneRaw);
    if (!phone) return;

    if (business.slug === "demo-store") {
      updateDevStoreChatResolution(business.slug, "SELLER", messageId, resolution);
      return;
    }

    const res = await fetch(
      `/api/public/${business.slug}/store-chat/${messageId}/resolution`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerPhone: phone, resolution }),
      }
    );
    if (!res.ok) throw new Error("resolution failed");
  }

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
    if (!phone) {
      setInquirySubmitError(
        locale === "he" ? "יש להזין מספר טלפון" : "Phone is required"
      );
      inquirySubmitLockRef.current = false;
      setInquirySubmitting(false);
      return;
    }
    if (!isValidPhone(phone)) {
      setInquirySubmitError(labels.invalidPhone);
      inquirySubmitLockRef.current = false;
      setInquirySubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/public/${business.slug}/inquiries`, {
        method: "POST",
        credentials: "include",
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
        setCustomerDeviceItem(customerNameKey(business.slug), name);
      }
      if (phone) {
        setCustomerDeviceItem(inquiryPhoneKey(business.slug), phone);
        setOrderPhone(phone);
        await loadMyInquiries(phone);
      }
      form.reset();
      setContactModalOpen(false);
      setContactDirectEntry(false);
      setInquirySuccessOpen(true);
    } catch {
      setInquirySubmitError(labels.inquirySubmitError);
    } finally {
      setInquirySubmitting(false);
      inquirySubmitLockRef.current = false;
    }
  }

  const myAppointments = useMemo(() => {
    const phone = parseIsraeliMobilePhone(orderPhone);
    if (!phone) return localAppointments;
    return localAppointments.filter(
      (a) => parseIsraeliMobilePhone(a.customerPhone) === phone
    );
  }, [localAppointments, orderPhone]);

  function appointmentEndMs(entry: CustomerAppointmentEntry) {
    return new Date(entry.endAt ?? entry.startAt).getTime();
  }

  const activeAppointments = useMemo(
    () =>
      myAppointments.filter(
        (a) => a.status !== "CANCELLED" && appointmentEndMs(a) > Date.now()
      ),
    [myAppointments]
  );

  const detailAppointment = useMemo(
    () =>
      detailAppointmentId
        ? (myAppointments.find((a) => a.id === detailAppointmentId) ?? null)
        : null,
    [detailAppointmentId, myAppointments]
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

    if (!isValidPhone(payload.phone)) {
      setBookingError(labels.invalidPhone);
      setBookingSubmitting(false);
      return;
    }
    const phone = parseIsraeliMobilePhone(payload.phone)!;
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
          credentials: "include",
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
      setCustomerDeviceItem(customerNameKey(business.slug), payload.name.trim());
      setCustomerDeviceItem(inquiryPhoneKey(business.slug), phone);

      const next = appendCustomerAppointmentHistory(business.slug, entry);
      setLocalAppointments(next);
      setBookingModalOpen(false);
      setBookingDay(null);
      setBookingSlots([]);
      setAppointmentSuccessOpen(true);
      setMainTab("settings");
      setActiveOrdersOpen(true);
    } finally {
      setBookingSubmitting(false);
    }
  }

  async function submitRentalBooking(payload: {
    slotId: string;
    checkInDateKey: string;
    checkOutDateKey: string;
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

    if (!isValidPhone(payload.phone)) {
      setBookingError(labels.invalidPhone);
      setBookingSubmitting(false);
      return;
    }
    const phone = parseIsraeliMobilePhone(payload.phone)!;
    const startAt = isoAtLocalTime(payload.checkInDateKey, 15, 0);
    const endAt = isoAtLocalTime(payload.checkOutDateKey, 11, 0);
    const notes = buildRentalNotes(
      payload.serviceName,
      payload.checkInDateKey,
      payload.checkOutDateKey,
      locale,
      payload.notes
    );

    try {
      let entry: CustomerAppointmentEntry;

      if (isDevRental) {
        entry = {
          id: `local-${Date.now()}`,
          slotId: payload.slotId,
          startAt,
          endAt,
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
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slotId: payload.slotId,
            customerName: payload.name,
            customerPhone: phone,
            serviceName: payload.serviceName,
            notes,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setBookingError(
            typeof data.error === "string" ? data.error : labels.unavailable
          );
          return;
        }
        entry = {
          ...(data.appointment as CustomerAppointmentEntry),
          startAt,
          endAt,
        };
      }

      setCustomerName(payload.name.trim());
      setOrderPhone(phone);
      setCustomerDeviceItem(customerNameKey(business.slug), payload.name.trim());
      setCustomerDeviceItem(inquiryPhoneKey(business.slug), phone);

      const next = appendCustomerAppointmentHistory(business.slug, entry);
      setLocalAppointments(next);
      setBookingModalOpen(false);
      setBookingDay(null);
      setBookingSlots([]);
      setAppointmentSuccessOpen(true);
      setMainTab("settings");
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

    setCancellingAppointment(true);
    try {
      if (!isDevSchedule) {
        const res = await fetch(`/api/public/${business.slug}/appointments`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentId,
            customerPhone: appt.customerPhone,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          code?: string;
        };
        if (res.status === 403 && data.code === "PHONE_VERIFICATION_REQUIRED") {
          setPendingCancelAppointmentId(appointmentId);
          setPhoneVerifyPrompt(appt.customerPhone);
          return;
        }
        if (!res.ok) return;
      }

      const next = updateCustomerAppointmentHistory(business.slug, appointmentId, {
        status: "CANCELLED",
      });
      setLocalAppointments(next);
    } finally {
      setCancellingAppointment(false);
    }
  }

  const futureSlots = business.slots.filter(
    (s) => new Date(s.startAt) > new Date()
  );

  const cartItemCount = activeOrderCount;

  const incrementProductInCart = useCallback((productId: string, maxQty: number) => {
    setCart((c) => {
      const current = c[productId] ?? 0;
      if (current >= maxQty) return c;
      return { ...c, [productId]: current + 1 };
    });
  }, []);

  const productCartHandlers = useMemo(() => {
    const map: Record<
      string,
      { onDec: () => void; onInc: () => void; onQtyChange: (value: number) => void }
    > = {};
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
        onQtyChange: (value: number) =>
          setCart((c) => ({
            ...c,
            [id]: Math.max(0, Math.min(maxQty, value)),
          })),
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
              imageUrls={p.imageUrls}
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
              onQtyChange={handlers?.onQtyChange ?? (() => {})}
            />
          );
        })}
      </div>
    );
  }

  function renderDealsGrid() {
    if (visibleDeals.length === 0) {
      return <EmptyStateCard message={labels.noDeals} />;
    }
    return (
      <div className="grid min-w-0 grid-cols-1 items-stretch justify-items-center gap-3">
        {visibleDeals.map((d) => (
          <DealCard
            key={d.id}
            name={d.name}
            imageUrl={d.imageUrl}
            dealPrice={d.dealPrice}
            validUntil={d.validUntil}
            products={d.products}
            locale={locale}
            storeTheme={displayTheme}
            labels={labels}
            faded={dealsInCartIds.has(d.id)}
            redeemDisabled={!dealHasStock(d)}
            onRedeem={() => addDealToActiveOrders(d)}
          />
        ))}
      </div>
    );
  }

  function openContactModal() {
    setContactDirectEntry(false);
    setContactView("menu");
    setContactModalOpen(true);
  }

  function openInquiryModal() {
    setContactDirectEntry(true);
    setContactView("inquiry");
    setContactModalOpen(true);
  }

  function closeContactModal() {
    setContactModalOpen(false);
    setContactDirectEntry(false);
    setContactView("menu");
  }

  function renderMyAppointmentsSection() {
    return (
      <SettingsCollapsibleSection
        title={isRental ? labels.myRentals : labels.myAppointments}
        icon={Receipt}
        expanded={activeOrdersOpen}
        onToggle={() => setActiveOrdersOpen((open) => !open)}
      >
        {activeAppointments.length === 0 ? (
          <HubEmptyText>
            {isRental ? labels.noActiveRentals : labels.noActiveAppts}
          </HubEmptyText>
        ) : (
          <ul className="space-y-2">
            {activeAppointments.map((appt) => (
              <li key={appt.id}>
                <AppointmentPreviewCard
                  serviceName={appt.serviceName}
                  startAt={appt.startAt}
                  endAt={appt.endAt}
                  rentalMode={isRental}
                  status={appt.status}
                  locale={locale}
                  labels={labels}
                  onClick={() => setDetailAppointmentId(appt.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </SettingsCollapsibleSection>
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
        return isScheduleLike ? (
          futureSlots.length > 0 ? (
            <CustomerAppointmentsHomeCalendar
              slots={business.slots}
              locale={locale}
              labels={labels}
              orderScheduleEnabled={effectiveOrderScheduleEnabled}
              orderSchedule={business.orderSchedule ?? null}
              bookingByDay={isRental || (business.appointmentBookingByDay ?? false)}
              rentalMode={isRental}
              storeTheme={displayTheme}
              businessSlug={business.slug}
              customerPhone={orderPhone}
              onNeedPhone={() => setProfileModalOpen(true)}
              onBook={(dateKey, slotsForBooking) => {
                setBookingDay(dateKey);
                setBookingSlots(slotsForBooking);
                setBookingError("");
                setBookingModalOpen(true);
              }}
            />
          ) : (
            <CustomerAppointmentsHomeShell>
              <div className="flex flex-1 items-center justify-center px-6">
                <EmptyStateCard message={labels.noSlots} />
              </div>
            </CustomerAppointmentsHomeShell>
          )
        ) : (
          <div className="space-y-4 p-1 pb-2">
            {renderProductGrid()}
          </div>
        );

      case "orders":
        return null;

      case "deals":
        return (
          <div className="pb-2">
            {isScheduleLike ? (
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
          <div className="space-y-3 pb-2">
            {isScheduleLike && phoneVerifyPrompt ? (
              <CustomerPhoneVerification
                slug={business.slug}
                phone={phoneVerifyPrompt}
                locale={locale}
                labels={labels}
                compact
                onVerified={() => {
                  setPhoneVerifyPrompt(null);
                  if (pendingCancelAppointmentId) {
                    const id = pendingCancelAppointmentId;
                    setPendingCancelAppointmentId(null);
                    void cancelMyAppointment(id);
                  }
                }}
              />
            ) : null}
            <div className="bakery-float-panel space-y-2 rounded-[24px] p-3">
              {isScheduleLike ? renderMyAppointmentsSection() : null}
              {panels.faq ? (
                <SettingsMenuRow
                  icon={HelpCircle}
                  title={labels.faq}
                  onClick={() => setFaqOpen(true)}
                />
              ) : null}
              {panels.inquiries ? (
                <SettingsMenuRow
                  icon={MessagesSquare}
                  title={labels.contactOptionInquiry}
                  onClick={openInquiryModal}
                />
              ) : null}
              {showWhatsAppContact && sellerWhatsAppHref ? (
                <CustomerWhatsAppContactRow
                  title={labels.contactOptionWhatsApp}
                  href={sellerWhatsAppHref}
                  unavailableLabel={labels.contactOptionWhatsAppUnavailable}
                />
              ) : null}
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

  const appointmentsHomeActive =
    isScheduleLike && mainTab === "home" && !unavailable;

  const showCartCheckoutBar =
    !unavailable && !isScheduleLike && cartHasItems;

  const storeBody = (
    <>
      <div className={CUSTOMER_VIEWPORT_HEIGHT}>
        <div className={`${CUSTOMER_MOBILE_STACK} ${CUSTOMER_PAGE_ROOT}`}>
          {!unavailable && showSellerNoticeBanner && (
            <div className="shrink-0">
              <CustomerSellerNoticeBanner
                message={sellerNoticeMessage}
                labels={labels}
                open={sellerNoticeExpanded}
                onOpen={openSellerNotice}
                onClose={closeSellerNoticeModal}
                onDismiss={dismissSellerNotice}
                unread={sellerNoticeUnread}
                rentalMode={isRental}
              />
            </div>
          )}
          <main
            className={
              appointmentsHomeActive
                ? CUSTOMER_SCROLL_MAIN_APPOINTMENTS_HOME
                : showCartCheckoutBar
                  ? CUSTOMER_SCROLL_MAIN_WITH_CHECKOUT
                  : CUSTOMER_SCROLL_MAIN
            }
          >
            {renderMainContent()}
          </main>
        </div>
      </div>

      {showCartCheckoutBar && (
        <CustomerCartCheckoutBar
          labels={labels}
          locale={locale}
          total={checkoutTotal}
          itemCount={activeOrderCount}
          onComplete={() => {
            setOrderError("");
            setOrderCheckoutOpen(true);
          }}
          onClear={clearActiveCart}
        />
      )}

      {!unavailable && (
        <CustomerStoreTabNav
          labels={labels}
          active={mainTab}
          onSelect={selectMainTab}
          ordersBadge={isScheduleLike ? undefined : cartItemCount}
          dealsBadge={dealsBadge > 0 ? dealsBadge : undefined}
          hideDeals={isScheduleLike || !panels.deals}
          hideOrders
          phoneColumn={isScheduleLike}
          isAppointments={isAppointments}
          isRental={isRental}
        />
      )}
    </>
  );

  return (
    <div
      lang={rootLang}
      dir={rootDir}
      className={`customer-store-root app-safe-top ${themeClass} ${textScaleClass} flex h-full min-h-0 w-full flex-col overflow-hidden`}
    >
      {isScheduleLike ? (
        <div
          className={`flex min-h-0 flex-1 justify-center ${CUSTOMER_PHONE_DESKTOP_BACKDROP}`}
        >
          <div className={CUSTOMER_PHONE_COLUMN}>
            {storeBody}
          </div>
        </div>
      ) : (
        storeBody
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
        onClose={closeContactModal}
        view={contactView}
        onViewChange={setContactView}
        directEntry={contactDirectEntry}
        slug={business.slug}
        storeName={business.name}
        sellerContactPhone={
          showWhatsAppContact ? business.sellerContactPhone : null
        }
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
        hideChat={!panels.chat}
        hideInquiries={!panels.inquiries}
        inquiryPhoneVerifyRequired={inquiryPhoneVerifyRequired}
        onInquiryPhoneVerified={() => {
          const phone =
            orderPhone ||
            (typeof window !== "undefined"
              ? getCustomerDeviceItem(inquiryPhoneKey(business.slug))
              : null) ||
            "";
          if (phone) void loadMyInquiries(phone);
        }}
        onSubmitInquiryResolution={submitInquiryResolution}
        onSubmitChatResolution={submitChatResolution}
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
          {profilePhoneError ? (
            <p
              role="alert"
              className="text-center text-[14px] font-semibold text-bakery-error"
            >
              {profilePhoneError}
            </p>
          ) : null}
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
            onChange={(e) => {
              setProfileDraftPhone(e.target.value);
              if (profilePhoneError) setProfilePhoneError("");
            }}
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
        locale={locale}
      />
      )}

      {appointmentSuccessOpen && (
        <CelebrationModal
          open
          onClose={() => setAppointmentSuccessOpen(false)}
          tone="calendar"
          title={
            isRental
              ? labels.rentalBookedTitle
              : labels.appointmentBookedTitle
          }
          detail={
            isRental
              ? labels.rentalBookedDetail
              : labels.appointmentBookedDetail
          }
          buttonLabel={labels.great}
          closeAriaLabel={labels.close}
          locale={locale}
        />
      )}

      {isRental ? (
        <CustomerRentalBookingModal
          open={bookingModalOpen}
          onClose={() => {
            setBookingModalOpen(false);
            setBookingDay(null);
            setBookingSlots([]);
            setBookingError("");
          }}
          checkInDateKey={bookingDay}
          slots={bookingSlots.length > 0 ? bookingSlots : business.slots}
          services={business.products.map((p) => ({ id: p.id, name: p.name }))}
          locale={locale}
          labels={labels}
          storeTheme={displayTheme}
          initialName={customerName}
          initialPhone={orderPhone}
          submitting={bookingSubmitting}
          error={bookingError}
          onSubmit={submitRentalBooking}
        />
      ) : (
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
      )}

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
            {formatCustomerOrderNumbers(
              historyDetailOrder.orderNumber,
              historyDetailOrder.orderNumbers
            ) ? (
              <p className="text-center text-[14px] font-bold text-bakery-muted">
                {labels.orderNumber}{" "}
                {formatCustomerOrderNumbers(
                  historyDetailOrder.orderNumber,
                  historyDetailOrder.orderNumbers
                )}
              </p>
            ) : null}
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

      <CustomerAppointmentDetailModal
        open={detailAppointment !== null}
        onClose={() => setDetailAppointmentId(null)}
        appointment={detailAppointment}
        locale={locale}
        labels={labels}
        storeTheme={displayTheme}
        rentalMode={isRental}
        canCancel={
          detailAppointment
            ? canCustomerCancelAppointment(
                detailAppointment.startAt,
                appointmentCancelPolicy,
                detailAppointment.status
              )
            : false
        }
        cancelling={cancellingAppointment}
        onCancel={
          detailAppointment
            ? () => void cancelMyAppointment(detailAppointment.id)
            : undefined
        }
      />

      <CelebrationModal
        open={inquirySuccessOpen}
        onClose={() => setInquirySuccessOpen(false)}
        title={labels.inquirySentTitle}
        detail={labels.inquirySentDetail}
        buttonLabel={labels.sellerNoticeGotIt}
        closeAriaLabel={locale === "he" ? "סגור" : "Close"}
        locale={locale}
      />

      <CustomerCookieConsent businessSlug={business.slug} locale={locale} />
    </div>
  );
}
