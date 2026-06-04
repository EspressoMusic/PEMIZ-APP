"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CornerUpRight,
  FileText,
  Heart,
  MessageCircle,
  Send,
  Users,
  X,
} from "lucide-react";
import { Button, Input, Textarea, Panel } from "@/components/ui";
import {
  CustomerCenterModal,
  CustomerModalHeaderBar,
} from "@/components/customer/customer-center-modal";
import { SettingsMenuRow } from "@/components/customer/customer-ui";
import type { CustomerLabels } from "@/components/customer/customer-labels";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import type { StoreChatChannel, StoreChatMessageDto } from "@/lib/store-chat";
import { replySnippet } from "@/lib/store-chat";
import {
  appendDevStoreChat,
  enrichDevCommunityMessages,
  filterDevSellerChat,
  loadDevStoreChat,
  toggleDevCommunityLike,
} from "@/lib/customer-chat-storage";
import { normalizePhone } from "@/lib/phone";

function formatChatTime(iso: string, locale: CustomerLocale) {
  return new Date(iso).toLocaleTimeString(
    locale === "he" ? "he-IL" : "en-GB",
    { hour: "2-digit", minute: "2-digit" }
  );
}

export type ContactView = "menu" | "inquiry" | "seller-chat" | "community";

type MyInquiry = {
  id: string;
  subject?: string;
  message: string;
  sellerReply: string | null;
};

export function CustomerContactModal({
  open,
  onClose,
  view,
  onViewChange,
  slug,
  locale,
  storeTheme,
  labels,
  customerName,
  customerPhone,
  isDevPreview,
  myInquiries,
  inquirySent,
  onSubmitInquiry,
}: {
  open: boolean;
  onClose: () => void;
  view: ContactView;
  onViewChange: (view: ContactView) => void;
  slug: string;
  locale: CustomerLocale;
  storeTheme: StoreThemeId;
  labels: CustomerLabels;
  customerName: string;
  customerPhone: string;
  isDevPreview: boolean;
  myInquiries: MyInquiry[];
  inquirySent: boolean;
  onSubmitInquiry: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [chatMessages, setChatMessages] = useState<StoreChatMessageDto[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [replyTo, setReplyTo] = useState<StoreChatMessageDto | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const channel: StoreChatChannel | null =
    view === "seller-chat"
      ? "SELLER"
      : view === "community"
        ? "COMMUNITY"
        : null;

  const closeLabel = locale === "he" ? "סגור" : "Close";

  const title =
    view === "menu"
      ? labels.contactSeller
      : view === "inquiry"
        ? labels.contactOptionInquiry
        : view === "seller-chat"
          ? labels.contactOptionSellerChat
          : view === "community"
            ? labels.contactOptionCommunity
            : labels.contactSeller;

  const loadChat = useCallback(async () => {
    if (!channel) return;
    setChatError("");
    if (isDevPreview) {
      const all = loadDevStoreChat(slug, channel);
      let list =
        channel === "SELLER"
          ? filterDevSellerChat(all, customerPhone)
          : all.filter((m) => m.channel === "COMMUNITY");
      if (channel === "COMMUNITY") {
        list = enrichDevCommunityMessages(list, customerPhone);
      }
      setChatMessages(list);
      return;
    }

    const phone = normalizePhone(customerPhone);
    if (phone.length < 9) {
      setChatMessages([]);
      setChatError(labels.chatPhoneRequired);
      return;
    }

    setChatLoading(true);
    try {
      const q =
        channel === "SELLER"
          ? `channel=SELLER&phone=${encodeURIComponent(customerPhone)}`
          : `channel=COMMUNITY&phone=${encodeURIComponent(customerPhone)}`;
      const res = await fetch(`/api/public/${slug}/store-chat?${q}`);
      const data = await res.json();
      if (!res.ok) {
        setChatError((data as { error?: string }).error ?? labels.chatLoadError);
        return;
      }
      setChatMessages(data.messages ?? []);
    } catch {
      setChatError(labels.chatLoadError);
    } finally {
      setChatLoading(false);
    }
  }, [
    channel,
    slug,
    customerPhone,
    isDevPreview,
    labels.chatLoadError,
    labels.chatPhoneRequired,
  ]);

  useEffect(() => {
    if (!open || !channel) return;
    setReplyTo(null);
    void loadChat();
    const id = window.setInterval(() => void loadChat(), 5000);
    return () => window.clearInterval(id);
  }, [open, channel, loadChat]);

  useEffect(() => {
    if (view !== "community") setReplyTo(null);
  }, [view]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMessages, view]);

  async function sendChat() {
    if (!channel) return;
    const body = chatDraft.trim();
    if (!body) return;
    const name = customerName.trim();
    const phone = customerPhone.trim();
    if (name.length < 2) {
      setChatError(labels.chatNameRequired);
      return;
    }
    if (normalizePhone(phone).length < 9) {
      setChatError(labels.chatPhoneRequired);
      return;
    }

    setChatError("");
    const replyToId =
      view === "community" && replyTo ? replyTo.id : undefined;

    if (isDevPreview) {
      const parent = replyToId
        ? chatMessages.find((m) => m.id === replyToId)
        : undefined;
      const msg: StoreChatMessageDto = {
        id: `dev-${Date.now()}`,
        channel,
        customerPhone: normalizePhone(phone),
        customerName: name,
        authorRole: "CUSTOMER",
        body,
        createdAt: new Date().toISOString(),
        replyToId: replyToId ?? null,
        likedByPhones: [],
        likeCount: 0,
        likedByMe: false,
        replyTo: parent
          ? {
              id: parent.id,
              customerName: parent.customerName,
              body: replySnippet(parent.body),
            }
          : null,
      };
      appendDevStoreChat(slug, channel, msg);
      setChatDraft("");
      setReplyTo(null);
      void loadChat();
      return;
    }

    const res = await fetch(`/api/public/${slug}/store-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel,
        customerName: name,
        customerPhone: phone,
        body,
        replyToId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setChatError((data as { error?: string }).error ?? labels.chatSendError);
      return;
    }
    setChatDraft("");
    setReplyTo(null);
    void loadChat();
  }

  async function toggleLike(messageId: string) {
    const phone = customerPhone.trim();
    if (normalizePhone(phone).length < 9) {
      setChatError(labels.chatPhoneRequired);
      return;
    }
    setChatError("");
    if (isDevPreview) {
      toggleDevCommunityLike(slug, messageId, phone);
      void loadChat();
      return;
    }
    const res = await fetch(`/api/public/${slug}/store-chat/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, customerPhone: phone }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setChatError((data as { error?: string }).error ?? labels.chatSendError);
      return;
    }
    void loadChat();
  }

  function renderMenu() {
    return (
      <div className="space-y-2 px-4 py-4">
        <SettingsMenuRow
          icon={FileText}
          title={labels.contactOptionInquiry}
          onClick={() => onViewChange("inquiry")}
        />
        <SettingsMenuRow
          icon={MessageCircle}
          title={labels.contactOptionSellerChat}
          onClick={() => onViewChange("seller-chat")}
        />
        <SettingsMenuRow
          icon={Users}
          title={labels.contactOptionCommunity}
          onClick={() => onViewChange("community")}
        />
      </div>
    );
  }

  function renderInquiry() {
    return (
      <div className="space-y-3 px-4 py-4">
        {inquirySent && (
          <p className="text-center text-[14px] font-semibold text-bakery-success">
            {labels.inquirySent}
          </p>
        )}
        {myInquiries.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-center text-[16px] font-extrabold text-bakery-ink">
              {labels.yourInquiries}
            </h2>
            {myInquiries.map((inq) => (
              <Panel key={inq.id} className="space-y-2">
                {inq.subject ? (
                  <p className="text-[15px] font-extrabold text-bakery-ink">
                    {inq.subject}
                  </p>
                ) : null}
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
          <form onSubmit={onSubmitInquiry} className="space-y-3">
            <Input
              name="customerName"
              label={labels.name}
              defaultValue={customerName}
              required
            />
            <Input
              name="customerPhone"
              label={labels.phone}
              type="tel"
              defaultValue={customerPhone}
            />
            <Input name="subject" label={labels.inquirySubject} required />
            <Textarea
              name="message"
              label={labels.inquiryDetails}
              rows={4}
              required
            />
            <Button type="submit" className="w-full min-h-[48px]">
              {labels.send}
            </Button>
          </form>
        </Panel>
      </div>
    );
  }

  const isChatView = view === "seller-chat" || view === "community";

  function renderChat() {
    return (
      <div className="customer-wa-chat">
        <div ref={scrollRef} className="customer-wa-chat__messages">
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
              const mine =
                view === "community"
                  ? normalizePhone(m.customerPhone ?? "") ===
                    normalizePhone(customerPhone)
                  : m.authorRole === "CUSTOMER";
              const showReactions = view === "community";
              return (
                <div
                  key={m.id}
                  className={`customer-wa-chat__row ${mine ? "customer-wa-chat__row--out" : "customer-wa-chat__row--in"}`}
                >
                  <div
                    className={`customer-wa-chat__bubble ${mine ? "customer-wa-chat__bubble--out" : "customer-wa-chat__bubble--in"}`}
                  >
                    {!mine && view === "community" && (
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
                    <div className="customer-wa-chat__meta">
                      <p className="customer-wa-chat__time">
                        {formatChatTime(m.createdAt, locale)}
                      </p>
                      {showReactions && (
                        <div className="customer-wa-chat__actions">
                          <button
                            type="button"
                            className="customer-wa-chat__action-btn"
                            onClick={() => setReplyTo(m)}
                            aria-label={labels.chatReply}
                          >
                            <CornerUpRight
                              className="h-4 w-4 rtl:scale-x-[-1]"
                              strokeWidth={2}
                            />
                            <span>{labels.chatReply}</span>
                          </button>
                          <button
                            type="button"
                            className={`customer-wa-chat__action-btn customer-wa-chat__action-btn--like ${m.likedByMe ? "is-liked" : ""}`}
                            onClick={() => void toggleLike(m.id)}
                            aria-label={labels.chatLike}
                          >
                            <Heart
                              className={`h-4 w-4 ${m.likedByMe ? "fill-current" : ""}`}
                              strokeWidth={2}
                            />
                            {(m.likeCount ?? 0) > 0 && (
                              <span>{m.likeCount}</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {chatError && (
          <p className="bg-bakery-cream-light px-3 py-1.5 text-center text-[12px] font-semibold text-bakery-error">
            {chatError}
          </p>
        )}
        {replyTo && view === "community" && (
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
              className="shrink-0 rounded-full p-1 text-bakery-muted hover:bg-bakery-card/80"
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
            value={chatDraft}
            onChange={(e) => setChatDraft(e.target.value)}
            placeholder={labels.chatPlaceholder}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendChat();
              }
            }}
          />
          <button
            type="button"
            className="customer-wa-chat__send"
            onClick={() => void sendChat()}
            disabled={!chatDraft.trim()}
            aria-label={labels.send}
          >
            <Send className="h-5 w-5 rtl:scale-x-[-1]" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <CustomerCenterModal
      open={open}
      onClose={onClose}
      locale={locale}
      storeTheme={storeTheme}
      panelClassName={isChatView ? "customer-center-modal__panel--chat" : ""}
      bodyClassName={
        isChatView ? "flex min-h-0 flex-1 flex-col overflow-hidden p-0" : ""
      }
      ariaLabel={title}
      header={
        view === "menu" ? (
          <div className="flex shrink-0 justify-end border-b border-bakery-border/25 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[15px] font-semibold text-bakery-ink transition hover:bg-bakery-card/80"
            >
              <X className="h-5 w-5" strokeWidth={2} />
              {closeLabel}
            </button>
          </div>
        ) : (
          <CustomerModalHeaderBar
            title={title}
            onClose={onClose}
            closeLabel={closeLabel}
            leading={
              <button
                type="button"
                onClick={() => onViewChange("menu")}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-semibold text-bakery-ink"
              >
                <ArrowRight className="h-5 w-5 rtl:rotate-180" strokeWidth={2} />
                {labels.back}
              </button>
            }
          />
        )
      }
    >
      {view === "menu" && renderMenu()}
      {view === "inquiry" && renderInquiry()}
      {(view === "seller-chat" || view === "community") && renderChat()}
    </CustomerCenterModal>
  );
}
