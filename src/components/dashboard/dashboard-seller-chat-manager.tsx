"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, CornerUpRight, Send, X } from "lucide-react";
import { Panel } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  DASHBOARD_PAGE_ROOT,
  DASHBOARD_SCROLL_MAIN,
} from "@/components/dashboard/dashboard-panel-frame";
import type { StoreChatMessageDto } from "@/lib/store-chat";
import type { SellerChatThread } from "@/lib/seller-chat-threads";
import {
  appendDevStoreChat,
  enrichDevCommunityMessages,
  filterDevSellerChat,
  loadDevStoreChat,
} from "@/lib/customer-chat-storage";
import {
  DEV_PREVIEW_COMMUNITY_CHAT,
  DEV_PREVIEW_SELLER_CHAT,
  DEV_PREVIEW_SELLER_THREADS,
} from "@/lib/dev-preview-data";
import { normalizePhone } from "@/lib/phone";

type ChatMode = "private" | "community";

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
  const { labels, locale } = useAppLocale();
  const [mode, setMode] = useState<ChatMode>("private");
  const [threads, setThreads] = useState<SellerChatThread[]>([]);
  const [activePhone, setActivePhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<StoreChatMessageDto[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<StoreChatMessageDto | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.customerPhone === activePhone);

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
        const seed =
          stored.length > 0 ? stored : DEV_PREVIEW_SELLER_CHAT;
        setMessages(filterDevSellerChat(seed, phone));
        setLoading(false);
        return;
      }
      const res = await fetch(
        `/api/dashboard/store-chat?phone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      setLoading(false);
      if (res.ok) setMessages(data.messages ?? []);
      else setError(data.error ?? labels.networkError);
    },
    [isDevPreview, businessSlug, labels.networkError]
  );

  const loadCommunityMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    if (isDevPreview) {
      const list = enrichDevCommunityMessages(
        loadDevStoreChat(businessSlug, "COMMUNITY").length > 0
          ? loadDevStoreChat(businessSlug, "COMMUNITY")
          : DEV_PREVIEW_COMMUNITY_CHAT,
        ""
      );
      setMessages(list);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/dashboard/store-chat?channel=COMMUNITY");
    const data = await res.json();
    setLoading(false);
    if (res.ok) setMessages(data.messages ?? []);
    else setError(data.error ?? labels.networkError);
  }, [isDevPreview, businessSlug, labels.networkError]);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    setActivePhone(null);
    setReplyTo(null);
    setDraft("");
    if (mode === "community") {
      void loadCommunityMessages();
    } else {
      setMessages([]);
    }
  }, [mode, loadCommunityMessages]);

  useEffect(() => {
    if (mode !== "private" || !activePhone) return;
    void loadPrivateMessages(activePhone);
    const id = window.setInterval(
      () => loadPrivateMessages(activePhone),
      5000
    );
    return () => window.clearInterval(id);
  }, [mode, activePhone, loadPrivateMessages]);

  useEffect(() => {
    if (mode !== "community") return;
    const id = window.setInterval(() => loadCommunityMessages(), 5000);
    return () => window.clearInterval(id);
  }, [mode, loadCommunityMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, mode, activePhone]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text) return;
    setError("");

    if (mode === "community") {
      if (isDevPreview) {
        const msg: StoreChatMessageDto = {
          id: `dev-seller-${Date.now()}`,
          channel: "COMMUNITY",
          customerPhone: null,
          customerName: businessName || "המוכר",
          authorRole: "SELLER",
          body: text,
          createdAt: new Date().toISOString(),
          replyToId: replyTo?.id ?? null,
          replyTo: replyTo
            ? {
                id: replyTo.id,
                customerName: replyTo.customerName,
                body: replyTo.body.slice(0, 80),
              }
            : null,
        };
        appendDevStoreChat(businessSlug, "COMMUNITY", msg);
        setDraft("");
        setReplyTo(null);
        void loadCommunityMessages();
        return;
      }

      const res = await fetch("/api/dashboard/store-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "COMMUNITY",
          body: text,
          replyToId: replyTo?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? labels.networkError);
        return;
      }
      setDraft("");
      setReplyTo(null);
      void loadCommunityMessages();
      return;
    }

    if (!activePhone) return;

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

  function renderChatBubbles() {
    const isCommunity = mode === "community";

    return (
      <div className="customer-wa-chat flex min-h-[min(52dvh,440px)] flex-1 flex-col">
        <div ref={scrollRef} className="customer-wa-chat__messages min-h-0 flex-1">
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
                    {!mine && isCommunity && (
                      <p className="customer-wa-chat__sender">{m.customerName}</p>
                    )}
                    {!mine && !isCommunity && (
                      <p className="customer-wa-chat__sender">{m.customerName}</p>
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
                    {isCommunity && !mine && (
                      <button
                        type="button"
                        className="customer-wa-chat__action-btn mt-1"
                        onClick={() => setReplyTo(m)}
                      >
                        <CornerUpRight
                          className="h-4 w-4 rtl:scale-x-[-1]"
                          strokeWidth={2}
                        />
                        <span>{labels.chatReply}</span>
                      </button>
                    )}
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
        {replyTo && isCommunity && (
          <div className="customer-wa-chat__reply-bar">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-bakery-primary">
                {labels.replyingTo} {replyTo.customerName}
              </p>
              <p className="truncate text-[13px] text-bakery-muted">
                {replyTo.body}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full p-1 text-bakery-muted"
              onClick={() => setReplyTo(null)}
              aria-label={labels.cancelReply}
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        )}
        <div className="customer-wa-chat__composer">
          <textarea
            className="customer-wa-chat__input"
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={labels.chatPlaceholder}
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
            disabled={!draft.trim() || (mode === "private" && !activePhone)}
            aria-label={labels.send}
          >
            <Send className="h-5 w-5 rtl:scale-x-[-1]" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${DASHBOARD_PAGE_ROOT} pb-2`}>
      <div className={`${DASHBOARD_SCROLL_MAIN} space-y-3`}>
        <p className="text-center text-[13px] font-semibold leading-snug text-bakery-muted">
          {labels.sellerChatNotInquiries}
        </p>

        <div className="grid grid-cols-2 gap-2 rounded-[16px] border border-bakery-border/35 bg-bakery-card/60 p-1">
          <button
            type="button"
            onClick={() => setMode("private")}
            className={`rounded-[12px] px-2 py-2.5 text-[13px] font-extrabold transition ${
              mode === "private"
                ? "bg-bakery-primary text-bakery-on-primary shadow-sm"
                : "text-bakery-muted"
            }`}
          >
            {labels.sellerChatTabPrivate}
          </button>
          <button
            type="button"
            onClick={() => setMode("community")}
            className={`rounded-[12px] px-2 py-2.5 text-[13px] font-extrabold transition ${
              mode === "community"
                ? "bg-bakery-primary text-bakery-on-primary shadow-sm"
                : "text-bakery-muted"
            }`}
          >
            {labels.sellerChatTabCommunity}
          </button>
        </div>

        {mode === "private" && !activePhone && (
          <div className="space-y-2">
            {threads.length === 0 ? (
              <Panel>
                <p className="text-center text-[15px] font-bold text-bakery-ink">
                  {labels.sellerChatEmpty}
                </p>
              </Panel>
            ) : (
              threads.map((t) => (
                <button
                  key={t.customerPhone}
                  type="button"
                  onClick={() => setActivePhone(t.customerPhone)}
                  className="block w-full rounded-[18px] border-[1.2px] border-bakery-border/45 bg-bakery-square px-4 py-3 text-start transition active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[16px] font-extrabold text-bakery-ink">
                      {t.customerName}
                    </p>
                    {t.unreadFromCustomer && (
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-bakery-error" />
                    )}
                  </div>
                  <p className="text-[12px] text-bakery-muted">{t.customerPhone}</p>
                  <p className="mt-1 line-clamp-2 text-[14px] text-bakery-ink">
                    {t.lastMessage}
                  </p>
                </button>
              ))
            )}
          </div>
        )}

        {mode === "private" && activePhone && (
          <div className="flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-bakery-border/40 bg-bakery-square">
            <div className="flex items-center gap-2 border-b border-bakery-border/25 px-3 py-2.5">
              <button
                type="button"
                onClick={() => {
                  setActivePhone(null);
                  setMessages([]);
                }}
                className="inline-flex items-center gap-1 text-[14px] font-bold text-bakery-ink"
              >
                <ArrowRight className="h-5 w-5 rtl:rotate-180" strokeWidth={2} />
                {labels.sellerChatBackToList}
              </button>
              <p className="min-w-0 flex-1 truncate text-center text-[15px] font-extrabold text-bakery-ink">
                {activeThread?.customerName ?? activePhone}
              </p>
            </div>
            {renderChatBubbles()}
          </div>
        )}

        {mode === "community" && (
          <div className="overflow-hidden rounded-[20px] border border-bakery-border/40 bg-bakery-square">
            {renderChatBubbles()}
          </div>
        )}
      </div>
    </div>
  );
}
