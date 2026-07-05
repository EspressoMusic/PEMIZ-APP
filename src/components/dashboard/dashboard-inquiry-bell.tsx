"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useVisibilityInterval } from "@/hooks/use-visibility-interval";
import { Bell, Send, X } from "lucide-react";
import { Alert, Textarea } from "@/components/ui";
import {
  DEV_PREVIEW_ORDERS,
  DEV_PREVIEW_SELLER_CHAT,
  getDevPreviewCustomerOrdersFromAppointments,
  getDevPreviewCustomerOrdersFromRental,
} from "@/lib/dev-preview-data";
import { isScheduleLikeBusinessType, type BusinessType } from "@/lib/types";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { getDashboardLabels } from "@/lib/app-locale";
import {
  customerProfileInitial,
  useDashboardCustomerProfile,
} from "@/components/dashboard/dashboard-customer-profile";
import {
  buildDevAppointmentsDashboardNotifications,
  buildDevDashboardNotifications,
  buildDevRentalDashboardNotifications,
  isStoreOnlyNotificationKind,
  notificationKindLabel,
  type DashboardNotification,
} from "@/lib/dashboard-notifications-client";
import type { StoreChatMessageDto } from "@/lib/store-chat";
import {
  appendDevStoreChat,
  filterDevSellerChat,
  loadDevStoreChat,
} from "@/lib/customer-chat-storage";
import { normalizePhone } from "@/lib/phone";
import { chatMessagesEqual } from "@/lib/store-chat-query";
import {
  DASHBOARD_PRESSABLE_CLASS,
  getDashboardPressProps,
} from "@/lib/dashboard-press";

function formatChatTime(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(
    locale === "he" ? "he-IL" : "en-GB",
    { hour: "2-digit", minute: "2-digit" }
  );
}

function dismissedNotificationsKey(businessSlug: string) {
  return `linky-dashboard-notifications-dismissed:${businessSlug}`;
}

function readDismissedNotificationIds(businessSlug: string) {
  if (typeof sessionStorage === "undefined") return new Set<string>();
  try {
    const raw = sessionStorage.getItem(dismissedNotificationsKey(businessSlug));
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set<string>();
  } catch {
    return new Set<string>();
  }
}

function writeDismissedNotificationIds(
  businessSlug: string,
  ids: Set<string>
) {
  try {
    sessionStorage.setItem(
      dismissedNotificationsKey(businessSlug),
      JSON.stringify([...ids])
    );
  } catch {
    /* ignore */
  }
}

function withoutDismissedNotifications(
  items: DashboardNotification[],
  dismissed: Set<string>
) {
  return items.filter((item) => !dismissed.has(item.id));
}

export function DashboardInquiryBell({
  businessSlug,
  basePath = "/dashboard",
  previewOnly = false,
  businessType = "STORE",
  darkTile = true,
}: {
  businessSlug: string;
  inquiriesHref?: string;
  basePath?: string;
  previewOnly?: boolean;
  businessType?: BusinessType;
  /** Dark brown tile (e.g. on home orders panel). */
  darkTile?: boolean;
}) {
  const isScheduleLike = isScheduleLikeBusinessType(businessType);
  const { labels, formatDateTime, locale } = useAppLocale();
  const previewOrders = useMemo(
    () =>
      previewOnly
        ? businessType === "RENTAL"
          ? getDevPreviewCustomerOrdersFromRental()
          : businessType === "APPOINTMENTS"
            ? getDevPreviewCustomerOrdersFromAppointments()
            : DEV_PREVIEW_ORDERS
        : undefined,
    [previewOnly, businessType]
  );
  const { openCustomer, modal: customerModal } = useDashboardCustomerProfile({
    previewOnly,
    previewOrders,
    businessSlug,
  });

  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<DashboardNotification | null>(null);

  const [replyDraft, setReplyDraft] = useState("");
  const [replyError, setReplyError] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const [chatMessages, setChatMessages] = useState<StoreChatMessageDto[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const dismissedNotificationIdsRef = useRef(
    readDismissedNotificationIds(businessSlug)
  );

  const dismissNotificationFromList = useCallback(
    (notificationId: string) => {
      dismissedNotificationIdsRef.current.add(notificationId);
      writeDismissedNotificationIds(
        businessSlug,
        dismissedNotificationIdsRef.current
      );
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );
    },
    [businessSlug]
  );

  const load = useCallback(async () => {
    const dismissed = dismissedNotificationIdsRef.current;
    if (previewOnly) {
      const notificationLabels = getDashboardLabels(locale);
      const items =
        businessType === "RENTAL"
          ? buildDevRentalDashboardNotifications(notificationLabels)
          : businessType === "APPOINTMENTS"
            ? buildDevAppointmentsDashboardNotifications(notificationLabels)
            : buildDevDashboardNotifications(notificationLabels);
      setNotifications(withoutDismissedNotifications(items, dismissed));
      return;
    }
    const res = await fetch("/api/dashboard/notifications");
    const data = await res.json();
    if (!res.ok) return;
    const items: DashboardNotification[] = data.notifications ?? [];
    const filtered = isScheduleLike
      ? items.filter((item) => !isStoreOnlyNotificationKind(item.kind))
      : items;
    setNotifications(withoutDismissedNotifications(filtered, dismissed));
  }, [previewOnly, isScheduleLike, businessType, locale]);

  useEffect(() => {
    void load();
  }, [load]);

  useVisibilityInterval(() => void load(), 20_000, 45_000);

  const hasAlerts = notifications.length > 0;

  function openPanel() {
    setOpen(true);
    setActive(null);
    setReplyDraft("");
    setReplyError("");
    setChatDraft("");
    setChatError("");
    void load();
  }

  function closePanel() {
    setOpen(false);
    setActive(null);
    setReplyDraft("");
    setReplyError("");
    setChatMessages([]);
    setChatDraft("");
    setChatError("");
  }

  function openNotification(item: DashboardNotification) {
    dismissNotificationFromList(item.id);
    setActive(item);
    setReplyDraft("");
    setReplyError("");
    setChatDraft("");
    setChatError("");
    if (item.kind === "chat" && item.customerPhone) {
      void loadChatMessages(item.customerPhone);
    }
  }

  function backToList() {
    setActive(null);
    setReplyDraft("");
    setReplyError("");
    setChatMessages([]);
    setChatDraft("");
    setChatError("");
    void load();
  }

  async function dismissInquiry(inquiryId: string) {
    const notificationId = `inquiry:${inquiryId}`;
    if (previewOnly) {
      dismissNotificationFromList(notificationId);
      if (active?.inquiryId === inquiryId) backToList();
      return;
    }
    const res = await fetch(`/api/dashboard/inquiries/${inquiryId}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    dismissNotificationFromList(notificationId);
    if (active?.inquiryId === inquiryId) backToList();
  }

  async function sendInquiryReply() {
    if (!active?.inquiryId) return;
    setReplyError("");
    const text = replyDraft.trim();
    if (!text) {
      setReplyError(labels.replyRequired);
      return;
    }
    setSendingReply(true);
    try {
      if (previewOnly) {
        dismissNotificationFromList(active.id);
        backToList();
        return;
      }
      const res = await fetch(`/api/dashboard/inquiries/${active.inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerReply: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReplyError((data as { error?: string }).error ?? labels.networkError);
        return;
      }
      backToList();
    } catch {
      setReplyError(labels.networkError);
    } finally {
      setSendingReply(false);
    }
  }

  const loadChatMessages = useCallback(
    async (phone: string) => {
      setChatError("");
      if (previewOnly) {
        const stored = loadDevStoreChat(businessSlug, "SELLER");
        const seed = stored.length > 0 ? stored : DEV_PREVIEW_SELLER_CHAT;
        setChatMessages(filterDevSellerChat(seed, phone));
        return;
      }
      setChatLoading(true);
      try {
        const res = await fetch(
          `/api/dashboard/store-chat?phone=${encodeURIComponent(phone)}`
        );
        const data = await res.json();
        if (!res.ok) {
          setChatError((data as { error?: string }).error ?? labels.networkError);
          return;
        }
        const incoming = (data.messages ?? []) as StoreChatMessageDto[];
        setChatMessages((prev) =>
          chatMessagesEqual(prev, incoming) ? prev : incoming
        );
      } catch {
        setChatError(labels.networkError);
      } finally {
        setChatLoading(false);
      }
    },
    [previewOnly, businessSlug, labels.networkError]
  );

  async function sendChatReply() {
    const phone = active?.customerPhone;
    if (!phone) return;
    const text = chatDraft.trim();
    if (!text) return;
    setChatError("");

    if (previewOnly) {
      const msg: StoreChatMessageDto = {
        id: `dev-seller-${Date.now()}`,
        channel: "SELLER",
        customerPhone: normalizePhone(phone),
        customerName: active.customerName ?? labels.anonymousCustomer,
        authorRole: "SELLER",
        body: text,
        createdAt: new Date().toISOString(),
      };
      appendDevStoreChat(businessSlug, "SELLER", msg);
      setChatDraft("");
      void loadChatMessages(phone);
      setNotifications((prev) =>
        prev.filter((n) => n.id !== active.id)
      );
      return;
    }

    const res = await fetch("/api/dashboard/store-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerPhone: phone, body: text }),
    });
    const data = await res.json();
    if (!res.ok) {
      setChatError((data as { error?: string }).error ?? labels.networkError);
      return;
    }
    setChatDraft("");
    void loadChatMessages(phone);
    void load();
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el || chatMessages.length === 0) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
  }, [chatMessages]);

  function renderNotificationBar(item: DashboardNotification) {
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => openNotification(item)}
        className={`${DASHBOARD_PRESSABLE_CLASS} dashboard-notification-bar w-full text-start hover:opacity-95`}
        {...getDashboardPressProps<HTMLButtonElement>()}
      >
        <span className="dashboard-notification-bar__type">
          {notificationKindLabel(item.kind, labels)}
        </span>
        <span className="dashboard-notification-bar__body">
          <span className="block truncate text-[13px] font-extrabold text-bakery-ink">
            {item.subtitle}
          </span>
          {item.message ? (
            <span className="mt-0.5 block truncate text-[11px] font-semibold text-bakery-muted">
              {item.message}
            </span>
          ) : null}
        </span>
      </button>
    );
  }

  function renderDetail() {
    if (!active) return null;

    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {active.kind === "inquiry" && (
            <div className="space-y-3">
              {active.customerPhone ? (
                <button
                  type="button"
                  onClick={() =>
                    openCustomer({
                      customerName: active.customerName!,
                      customerPhone: active.customerPhone!,
                      fallbackDate: active.createdAt,
                    })
                  }
                  className="mx-auto flex items-center gap-2"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-bakery-border/35 bg-bakery-on-primary text-[16px] font-extrabold text-bakery-primary">
                    {customerProfileInitial(
                      active.customerName ?? "",
                      labels.anonymousCustomer
                    )}
                  </span>
                </button>
              ) : null}
              <p className="whitespace-pre-wrap rounded-[12px] border border-bakery-border/30 bg-bakery-cream-light p-3 text-[14px] leading-snug text-bakery-ink">
                {active.message}
              </p>
              <p className="text-center text-[11px] text-bakery-muted">
                {formatDateTime(active.createdAt)}
              </p>
              <Textarea
                label={labels.yourReply}
                labelClassName="block w-full text-center text-[13px] font-extrabold"
                rows={3}
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder={labels.replyToCustomer}
                className="dashboard-inquiry-reply-field min-h-[88px] resize-y text-[13px] !rounded-[10px]"
              />
              {replyError ? <Alert variant="error">{replyError}</Alert> : null}
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="dashboard-inquiry-cta min-w-[7.5rem]"
                  disabled={sendingReply}
                  onClick={() => void sendInquiryReply()}
                >
                  {sendingReply ? labels.sending : labels.sendReply}
                </button>
                {active.inquiryId ? (
                  <button
                    type="button"
                    className="dashboard-inquiry-cta dashboard-inquiry-cta--ghost min-w-[5.5rem]"
                    onClick={() => void dismissInquiry(active.inquiryId!)}
                  >
                    {labels.close}
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {active.kind === "chat" && active.customerPhone && (
            <div className="customer-wa-chat flex min-h-[min(42dvh,360px)] flex-col overflow-hidden rounded-[16px] border border-bakery-border/30">
              <div
                ref={chatScrollRef}
                className="customer-wa-chat__messages min-h-0 flex-1"
              >
                {chatLoading && chatMessages.length === 0 ? (
                  <p className="py-8 text-center text-[14px] text-bakery-muted">
                    {labels.chatLoading}
                  </p>
                ) : chatMessages.length === 0 ? (
                  <p className="py-8 text-center text-[14px] text-bakery-muted">
                    {labels.chatEmpty}
                  </p>
                ) : (
                  chatMessages.map((m) => {
                    const mine = m.authorRole === "SELLER";
                    return (
                      <div
                        key={m.id}
                        className={`customer-wa-chat__row ${mine ? "customer-wa-chat__row--out" : "customer-wa-chat__row--in"}`}
                      >
                        <div
                          className={`customer-wa-chat__bubble ${mine ? "customer-wa-chat__bubble--out" : "customer-wa-chat__bubble--in"}`}
                        >
                          <p className="customer-wa-chat__text">{m.body}</p>
                          <p className="customer-wa-chat__time">
                            {formatChatTime(m.createdAt, locale)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {chatError ? (
                <p className="bg-bakery-cream-light px-3 py-1.5 text-center text-[12px] font-semibold text-bakery-error">
                  {chatError}
                </p>
              ) : null}
              <div className="customer-wa-chat__composer">
                <textarea
                  className="customer-wa-chat__input"
                  rows={1}
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  placeholder={labels.chatPlaceholder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendChatReply();
                    }
                  }}
                />
                <button
                  type="button"
                  className="customer-wa-chat__send"
                  onClick={() => void sendChatReply()}
                  disabled={!chatDraft.trim()}
                  aria-label={labels.send}
                >
                  <Send className="h-5 w-5 rtl:scale-x-[-1]" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {active.kind === "new_order" && (
            <div className="space-y-3 text-center">
              <p className="rounded-[12px] border border-bakery-border/30 bg-bakery-cream-light p-3 text-[14px] font-semibold text-bakery-ink">
                {active.message}
              </p>
              <p className="text-[11px] text-bakery-muted">
                {formatDateTime(active.createdAt)}
              </p>
              <Link
                href={`${basePath}/settings/orders`}
                onClick={closePanel}
                className="dashboard-inquiry-cta inline-flex min-w-[10rem] no-underline"
              >
                {labels.notificationOpenOrders}
              </Link>
            </div>
          )}

          {active.kind === "new_appointment" && (
            <div className="space-y-3 text-center">
              {active.customerPhone ? (
                <button
                  type="button"
                  onClick={() =>
                    openCustomer({
                      customerName: active.customerName!,
                      customerPhone: active.customerPhone!,
                      fallbackDate: active.createdAt,
                    })
                  }
                  className="mx-auto flex items-center gap-2"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-bakery-border/35 bg-bakery-on-primary text-[16px] font-extrabold text-bakery-primary">
                    {customerProfileInitial(
                      active.customerName ?? "",
                      labels.anonymousCustomer
                    )}
                  </span>
                </button>
              ) : null}
              <p className="rounded-[12px] border border-bakery-border/30 bg-bakery-cream-light p-3 text-[14px] font-semibold text-bakery-ink">
                {active.message}
              </p>
              <p className="text-[11px] text-bakery-muted">
                {formatDateTime(active.createdAt)}
              </p>
              <Link
                href={`${basePath}/settings/appointments`}
                onClick={closePanel}
                className="dashboard-inquiry-cta inline-flex min-w-[10rem] no-underline"
              >
                {labels.notificationOpenAppointments}
              </Link>
            </div>
          )}

          {active.kind === "low_stock" && (
            <div className="space-y-3 text-center">
              <p className="text-[16px] font-extrabold text-bakery-ink">
                {active.productName}
              </p>
              <p className="rounded-[12px] border border-bakery-border/30 bg-bakery-cream-light p-3 text-[14px] font-semibold text-bakery-ink">
                {active.message}
              </p>
              <Link
                href={`${basePath}/settings/products`}
                onClick={closePanel}
                className="dashboard-inquiry-cta inline-flex min-w-[10rem] no-underline"
              >
                {labels.notificationOpenProducts}
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const panel = open ? (
    <div
      className="dashboard-surface fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={labels.notificationTitle}
    >
      <button
        type="button"
        className="dashboard-modal-backdrop absolute inset-0 z-0"
        onClick={closePanel}
        aria-label={labels.close}
      />
      <div className="dashboard-card dashboard-modal-card relative z-10 flex max-h-[min(85dvh,560px)] w-full max-w-md flex-col overflow-hidden">
        <div
          className={`relative shrink-0 px-4 py-3 ${
            active ? "pb-2 pt-2" : "border-b border-bakery-border/25"
          }`}
        >
          <button
            type="button"
            onClick={closePanel}
            className="absolute end-2 top-2 rounded-full p-2 text-bakery-muted hover:bg-bakery-primary/10"
            aria-label={labels.close}
          >
            <X className="h-6 w-6" />
          </button>
          {!active ? (
            <div className="px-10 text-center">
              <h2 className="text-[18px] font-extrabold text-bakery-ink">
                {labels.notificationTitle}
              </h2>
              <p className="text-[13px] font-semibold text-bakery-muted">
                {hasAlerts
                  ? String(notifications.length)
                  : labels.notificationEmpty}
              </p>
            </div>
          ) : null}
        </div>

        {active ? (
          renderDetail()
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-bakery-muted">
                {labels.notificationEmpty}
              </p>
            ) : (
              <ul className="flex w-full flex-col gap-2">
                {notifications.map((item) => (
                  <li key={item.id}>{renderNotificationBar(item)}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition ${
          darkTile
            ? "dashboard-icon-tile-dark hover:opacity-95"
            : "bakery-icon-tile"
        } ${hasAlerts ? "animate-bell-wiggle" : ""}`}
        aria-label={
          hasAlerts
            ? `${labels.notificationTitle} (${notifications.length})`
            : labels.notificationTitle
        }
      >
        <Bell className="h-6 w-6" strokeWidth={2} />
        {hasAlerts && (
          <span
            className={`dashboard-inquiry-dot ${darkTile ? "dashboard-inquiry-dot--dark-tile" : ""}`}
            aria-hidden
          />
        )}
      </button>

      {typeof document !== "undefined" && panel
        ? createPortal(panel, document.body)
        : null}
      {customerModal}
    </>
  );
}
