"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, Send } from "lucide-react";
import {
  customerProfileInitial,
  useDashboardCustomerProfile,
} from "@/components/dashboard/dashboard-customer-profile";
import { DEV_PREVIEW_ORDERS } from "@/lib/dev-preview-data";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";
import type { StoreChatMessageDto } from "@/lib/store-chat";
import type { SellerChatThread } from "@/lib/seller-chat-threads";
import {
  appendDevStoreChat,
  filterDevSellerChat,
  loadDevStoreChat,
} from "@/lib/customer-chat-storage";
import {
  DEV_PREVIEW_SELLER_CHAT,
  DEV_PREVIEW_SELLER_THREADS,
} from "@/lib/dev-preview-data";
import { normalizePhone } from "@/lib/phone";
import { chatMessagesEqual } from "@/lib/store-chat-query";
import { useVisibilityInterval } from "@/hooks/use-visibility-interval";

function formatChatTime(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(
    locale === "he" ? "he-IL" : "en-GB",
    { hour: "2-digit", minute: "2-digit" }
  );
}

export function DashboardSellerChatManager({
  isDevPreview = false,
  businessSlug = "demo-store",
  businessName = "",
}: {
  isDevPreview?: boolean;
  businessSlug?: string;
  businessName?: string;
}) {
  const { labels, locale, formatDayDate } = useAppLocale();
  const { openCustomer, modal: customerModal } = useDashboardCustomerProfile({
    previewOnly: isDevPreview,
    previewOrders: isDevPreview ? DEV_PREVIEW_ORDERS : undefined,
    businessSlug,
    businessName,
  });
  const [threads, setThreads] = useState<SellerChatThread[]>([]);
  const [activePhone, setActivePhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<StoreChatMessageDto[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesLenRef = useRef(0);

  const loadThreads = useCallback(async () => {
    if (isDevPreview) {
      setThreads(DEV_PREVIEW_SELLER_THREADS);
      return;
    }
    const res = await fetch("/api/dashboard/store-chat");
    const data = await res.json();
    if (res.ok) setThreads(data.threads ?? []);
  }, [isDevPreview]);

  const loadPrivateMessages = useCallback(
    async (phone: string) => {
      setLoading(true);
      setError("");
      if (isDevPreview) {
        const stored = loadDevStoreChat(businessSlug, "SELLER");
        const seed = stored.length > 0 ? stored : DEV_PREVIEW_SELLER_CHAT;
        setMessages(filterDevSellerChat(seed, phone));
        setLoading(false);
        return;
      }
      const res = await fetch(
        `/api/dashboard/store-chat?phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        const incoming = (data.messages ?? []) as StoreChatMessageDto[];
        setMessages((prev) =>
          chatMessagesEqual(prev, incoming) ? prev : incoming
        );
      } else setError(data.error ?? labels.networkError);
    },
    [isDevPreview, businessSlug, labels.networkError]
  );

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!activePhone) {
      setMessages([]);
      setDraft("");
      return;
    }
    void loadPrivateMessages(activePhone);
  }, [activePhone, loadPrivateMessages]);

  useVisibilityInterval(
    () => {
      if (activePhone) void loadPrivateMessages(activePhone);
    },
    8000,
    45_000,
    !!activePhone
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || messages.length === 0) return;
    if (messages.length > messagesLenRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
    }
    messagesLenRef.current = messages.length;
  }, [messages]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text || !activePhone) return;
    setError("");

    if (isDevPreview) {
      const msg: StoreChatMessageDto = {
        id: `dev-seller-${Date.now()}`,
        channel: "SELLER",
        customerPhone: normalizePhone(activePhone),
        customerName: businessName || "המוכר",
        authorRole: "SELLER",
        body: text,
        createdAt: new Date().toISOString(),
      };
      appendDevStoreChat(businessSlug, "SELLER", msg);
      setDraft("");
      void loadPrivateMessages(activePhone);
      void loadThreads();
      return;
    }

    const res = await fetch("/api/dashboard/store-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerPhone: activePhone, body: text }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? labels.networkError);
      return;
    }
    setDraft("");
    void loadPrivateMessages(activePhone);
    void loadThreads();
  }

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} pb-2`}>
      <div className={`${DASHBOARD_SCROLL_MAIN} space-y-3`}>
        {!activePhone && (
          <div className="dashboard-card bakery-float-panel rounded-[32px] p-3 text-start">
            {threads.length === 0 ? (
              <p className="py-6 text-center text-[15px] font-bold text-bakery-ink">
                {labels.sellerChatEmpty}
              </p>
            ) : (
              <ul className="space-y-2">
                {threads.map((t) => (
                  <li key={t.customerPhone}>
                    <div className="dashboard-action-square flex w-full items-center gap-3 rounded-[22px] px-3 py-3.5 text-start transition">
                      <button
                        type="button"
                        onClick={() =>
                          openCustomer({
                            customerName: t.customerName,
                            customerPhone: t.customerPhone,
                            fallbackDate: t.lastAt,
                          })
                        }
                        className="relative shrink-0"
                        aria-label={`${labels.customer}: ${t.customerName}`}
                      >
                        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[14px] border border-bakery-border/35 bg-bakery-on-primary text-[18px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]">
                          {customerProfileInitial(
                            t.customerName,
                            labels.anonymousCustomer
                          )}
                        </span>
                        {t.unreadFromCustomer && (
                          <span
                            className="dashboard-inquiry-pending-dot"
                            aria-label={labels.pending}
                          />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePhone(t.customerPhone)}
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-start"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-[16px] font-extrabold leading-tight text-bakery-ink">
                            {t.customerName}
                          </span>
                          <span className="mt-0.5 block text-[13px] font-medium text-bakery-muted">
                            {formatDayDate(t.lastAt)}
                          </span>
                        </span>
                        <ChevronLeft
                          className="h-5 w-5 shrink-0 text-bakery-muted rtl:rotate-180"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activePhone && (
          <div className="flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-bakery-border/40 bg-bakery-square">
            <div className="customer-wa-chat flex min-h-[min(52dvh,440px)] flex-1 flex-col">
              <div
                ref={scrollRef}
                className="customer-wa-chat__messages min-h-0 flex-1"
              >
                {loading && messages.length === 0 ? (
                  <p className="py-8 text-center text-[14px] text-bakery-muted">
                    {labels.chatLoading}
                  </p>
                ) : messages.length === 0 ? (
                  <p className="py-8 text-center text-[14px] text-bakery-muted">
                    {labels.chatEmpty}
                  </p>
                ) : (
                  messages.map((m) => {
                    const mine = m.authorRole === "SELLER";
                    return (
                      <div
                        key={m.id}
                        className={`customer-wa-chat__row ${mine ? "customer-wa-chat__row--out" : "customer-wa-chat__row--in"}`}
                      >
                        <div
                          className={`customer-wa-chat__bubble ${mine ? "customer-wa-chat__bubble--out" : "customer-wa-chat__bubble--in"}`}
                        >
                          {!mine && (
                            <p className="customer-wa-chat__sender">
                              {m.customerName}
                            </p>
                          )}
                          {m.replyTo && (
                            <div className="customer-wa-chat__quote">
                              <p className="customer-wa-chat__quote-name">
                                {m.replyTo.customerName}
                              </p>
                              <p className="customer-wa-chat__quote-body">
                                {m.replyTo.body}
                              </p>
                            </div>
                          )}
                          <p className="customer-wa-chat__text">{m.body}</p>
                          <p className="customer-wa-chat__time">
                            {formatChatTime(m.createdAt, locale)}
                          </p>
                          {mine && m.customerResolution === "RESOLVED" ? (
                            <p className="mt-1 text-[10px] font-bold text-emerald-700">
                              {labels.customerMarkedResolved}
                            </p>
                          ) : mine && m.customerResolution === "NOT_RESOLVED" ? (
                            <p className="mt-1 text-[10px] font-bold text-amber-800">
                              {labels.customerMarkedNotResolved}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {error && (
                <p className="bg-bakery-cream-light px-3 py-1.5 text-center text-[12px] font-semibold text-bakery-error">
                  {error}
                </p>
              )}
              <div className="customer-wa-chat__composer">
                <textarea
                  className="customer-wa-chat__input"
                  rows={1}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={labels.chatPlaceholder}
                  aria-label={labels.chatPlaceholder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendMessage();
                    }
                  }}
                />
                <button
                  type="button"
                  className="customer-wa-chat__send"
                  onClick={() => void sendMessage()}
                  disabled={!draft.trim()}
                  aria-label={labels.send}
                >
                  <Send className="h-5 w-5 rtl:scale-x-[-1]" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {customerModal}
    </div>
  );
}
