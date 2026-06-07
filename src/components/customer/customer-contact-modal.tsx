"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, FileText, MessageCircle, Send, X } from "lucide-react";
import { Button, Input, Textarea, Panel } from "@/components/ui";
import {
  CustomerCenterModal,
  CustomerModalHeaderBar,
} from "@/components/customer/customer-center-modal";
import { SettingsMenuRow } from "@/components/customer/customer-ui";
import type { CustomerLabels } from "@/components/customer/customer-labels";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import type { StoreChatMessageDto } from "@/lib/store-chat";
import {
  appendDevStoreChat,
  filterDevSellerChat,
  loadDevStoreChat,
} from "@/lib/customer-chat-storage";
import { normalizePhone } from "@/lib/phone";
import { chatMessagesEqual } from "@/lib/store-chat-query";
import { useVisibilityInterval } from "@/hooks/use-visibility-interval";

function formatChatTime(iso: string, locale: CustomerLocale) {
  return new Date(iso).toLocaleTimeString(
    locale === "he" ? "he-IL" : "en-GB",
    { hour: "2-digit", minute: "2-digit" }
  );
}

function formatInquiryDate(iso: string | undefined, locale: CustomerLocale) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export type ContactView = "menu" | "inquiry" | "seller-chat";

type MyInquiry = {
  id: string;
  subject?: string;
  message: string;
  sellerReply: string | null;
  sellerReplyAt?: string | null;
  createdAt?: string;
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
  inquirySubmitting = false,
  inquirySubmitError = "",
  hasPendingInquiry = false,
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
  inquirySubmitting?: boolean;
  inquirySubmitError?: string;
  hasPendingInquiry?: boolean;
  onSubmitInquiry: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [contactName, setContactName] = useState(customerName);
  const [contactPhone, setContactPhone] = useState(customerPhone);
  const [chatMessages, setChatMessages] = useState<StoreChatMessageDto[]>([]);
  const [chatDraft, setChatDraft] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatLenRef = useRef(0);
  const chatSendLockRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    setContactName(customerName);
    setContactPhone(customerPhone);
  }, [open, customerName, customerPhone]);

  const isSellerChat = view === "seller-chat";
  const closeLabel = locale === "he" ? "סגור" : "Close";

  const title =
    view === "menu"
      ? labels.contactSeller
      : view === "inquiry"
        ? labels.contactOptionInquiry
        : view === "seller-chat"
          ? labels.contactOptionSellerChat
          : labels.contactSeller;

  const loadChat = useCallback(async () => {
    if (!isSellerChat) return;
    setChatError("");

    if (isDevPreview) {
      const all = loadDevStoreChat(slug, "SELLER");
      setChatMessages(filterDevSellerChat(all, customerPhone));
      return;
    }

    const phone = normalizePhone(contactPhone);
    if (phone.length < 9) {
      setChatMessages([]);
      setChatError(labels.chatPhoneRequired);
      return;
    }

    if (chatLenRef.current === 0) setChatLoading(true);
    try {
      const q = `channel=SELLER&phone=${encodeURIComponent(phone)}`;
      const res = await fetch(`/api/public/${slug}/store-chat?${q}`);
      const data = await res.json();
      if (!res.ok) {
        setChatError((data as { error?: string }).error ?? labels.chatLoadError);
        return;
      }
      const incoming = (data.messages ?? []) as StoreChatMessageDto[];
      setChatMessages((prev) =>
        chatMessagesEqual(prev, incoming) ? prev : incoming
      );
    } catch {
      setChatError(labels.chatLoadError);
    } finally {
      setChatLoading(false);
    }
  }, [
    isSellerChat,
    slug,
    contactPhone,
    isDevPreview,
    labels.chatLoadError,
    labels.chatPhoneRequired,
  ]);

  useVisibilityInterval(() => void loadChat(), 8000, 45_000, open && isSellerChat);

  useEffect(() => {
    if (!open || !isSellerChat) return;
    void loadChat();
  }, [open, isSellerChat, loadChat]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || chatMessages.length === 0) return;
    if (chatMessages.length > chatLenRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
    }
    chatLenRef.current = chatMessages.length;
  }, [chatMessages]);

  async function sendChat() {
    if (!isSellerChat || chatSending || chatSendLockRef.current) return;
    const body = chatDraft.trim();
    if (!body) return;

    const name = contactName.trim();
    const phone = contactPhone.trim();
    const phoneNorm = normalizePhone(phone);
    if (name.length < 2) {
      setChatError(labels.chatNameRequired);
      return;
    }
    if (phoneNorm.length < 9) {
      setChatError(labels.chatPhoneRequired);
      return;
    }

    setChatError("");
    chatSendLockRef.current = true;
    setChatSending(true);

    const pendingId = `pending-${Date.now()}`;
    const optimistic: StoreChatMessageDto = {
      id: pendingId,
      channel: "SELLER",
      customerPhone: phoneNorm,
      customerName: name,
      authorRole: "CUSTOMER",
      body,
      createdAt: new Date().toISOString(),
    };

    setChatDraft("");
    setChatMessages((prev) => [...prev, optimistic]);

    try {
      if (isDevPreview) {
        const msg: StoreChatMessageDto = {
          id: `dev-${Date.now()}`,
          channel: "SELLER",
          customerPhone: phoneNorm,
          customerName: name,
          authorRole: "CUSTOMER",
          body,
          createdAt: new Date().toISOString(),
        };
        appendDevStoreChat(slug, "SELLER", msg);
        setChatMessages((prev) =>
          prev.map((m) => (m.id === pendingId ? msg : m))
        );
        return;
      }

      const res = await fetch(`/api/public/${slug}/store-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "SELLER",
          customerName: name,
          customerPhone: phone,
          body,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: StoreChatMessageDto;
      };
      if (!res.ok) {
        setChatMessages((prev) => prev.filter((m) => m.id !== pendingId));
        setChatDraft(body);
        setChatError(data.error ?? labels.chatSendError);
        return;
      }
      if (data.message) {
        setChatMessages((prev) =>
          prev.map((m) => (m.id === pendingId ? data.message! : m))
        );
      }
    } catch {
      setChatMessages((prev) => prev.filter((m) => m.id !== pendingId));
      setChatDraft(body);
      setChatError(labels.chatSendError);
    } finally {
      setChatSending(false);
      chatSendLockRef.current = false;
    }
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
      </div>
    );
  }

  function renderInquiry() {
    return (
      <div className="space-y-4 px-4 py-4">
        {hasPendingInquiry ? (
          <Panel className="rounded-[18px] border-[3px] border-[#5C4A3E]/22 bg-bakery-square px-4 py-4 text-center">
            <p className="text-[15px] font-semibold leading-relaxed text-bakery-ink">
              {labels.inquiryPendingBlocked}
            </p>
          </Panel>
        ) : (
          <Panel className="rounded-[18px] border-[3px] border-[#5C4A3E]/22 bg-bakery-square">
            <form onSubmit={onSubmitInquiry} className="space-y-3">
              {inquirySubmitError ? (
                <p
                  role="alert"
                  className="rounded-2xl bg-bakery-error/10 px-3 py-2 text-center text-[13px] font-semibold text-bakery-error"
                >
                  {inquirySubmitError}
                </p>
              ) : null}
              <Input
                name="customerName"
                label={labels.name}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                disabled={inquirySubmitting}
              />
              <Input
                name="customerPhone"
                label={labels.phone}
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                disabled={inquirySubmitting}
              />
              <Input
                name="subject"
                label={labels.inquirySubject}
                required
                disabled={inquirySubmitting}
              />
              <Textarea
                name="message"
                label={labels.inquiryDetails}
                rows={4}
                required
                minLength={5}
                disabled={inquirySubmitting}
              />
              <p className="text-center text-[12px] font-semibold text-bakery-muted">
                {locale === "he"
                  ? "פירוט הפנייה: לפחות 5 תווים"
                  : "Details: at least 5 characters"}
              </p>
              <Button
                type="submit"
                className="w-full min-h-[48px]"
                disabled={inquirySubmitting}
              >
                {inquirySubmitting
                  ? locale === "he"
                    ? "שולח..."
                    : "Sending..."
                  : labels.send}
              </Button>
            </form>
          </Panel>
        )}

        {myInquiries.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-center text-[16px] font-extrabold text-bakery-ink">
              {labels.yourPastInquiries}
            </h2>
            {myInquiries.map((inq) => (
              <div
                key={inq.id}
                className="overflow-hidden rounded-[18px] border-[3px] border-[#5C4A3E]/22 bg-bakery-square p-3 shadow-[0_3px_10px_rgba(58,47,38,0.1)]"
              >
                <div className="rounded-[14px] border border-bakery-border/20 bg-bakery-cream-light px-3 py-3">
                  {inq.createdAt ? (
                    <p className="mb-2 text-center text-[12px] font-bold text-bakery-muted">
                      {formatInquiryDate(inq.createdAt, locale)}
                    </p>
                  ) : null}
                  {inq.subject ? (
                    <p className="text-center text-[15px] font-extrabold text-bakery-ink">
                      {inq.subject}
                    </p>
                  ) : null}
                  <p className="mt-2 whitespace-pre-wrap text-center text-[15px] leading-relaxed text-bakery-ink">
                    {inq.message}
                  </p>
                  {inq.sellerReply ? (
                    <div className="mt-3 rounded-[12px] border border-bakery-primary/25 bg-bakery-primary/10 px-3 py-2">
                      <p className="text-center text-[12px] font-bold text-bakery-primary">
                        {labels.sellerReplyLabel}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-center text-[14px] leading-relaxed text-bakery-ink">
                        {inq.sellerReply}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-center text-[13px] font-semibold text-bakery-muted">
                      {labels.awaitingReply}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderChat() {
    const needsIdentity =
      contactName.trim().length < 2 || normalizePhone(contactPhone).length < 9;

    return (
      <div className="customer-wa-chat">
        {needsIdentity ? (
          <div className="space-y-2 border-b border-bakery-border/25 bg-bakery-square px-4 py-3">
            <Input
              label={labels.name}
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
            <Input
              label={labels.phone}
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        ) : null}
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
              const mine = m.authorRole === "CUSTOMER";
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
        {chatError && (
          <p className="bg-bakery-cream-light px-3 py-1.5 text-center text-[12px] font-semibold text-bakery-error">
            {chatError}
          </p>
        )}
        <div className="customer-wa-chat__composer">
          <textarea
            className="customer-wa-chat__input"
            rows={1}
            value={chatDraft}
            onChange={(e) => setChatDraft(e.target.value)}
            placeholder={labels.chatPlaceholder}
            disabled={chatSending}
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
            disabled={!chatDraft.trim() || chatSending}
            aria-busy={chatSending}
            aria-label={labels.send}
          >
            <Send className="h-5 w-5 rtl:scale-x-[-1]" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  if (!open) return null;

  return (
    <CustomerCenterModal
      open={open}
      onClose={onClose}
      locale={locale}
      storeTheme={storeTheme}
      panelClassName={isSellerChat ? "customer-center-modal__panel--chat" : ""}
      bodyClassName={
        isSellerChat ? "flex min-h-0 flex-1 flex-col overflow-hidden p-0" : ""
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
      {view === "seller-chat" && renderChat()}
    </CustomerCenterModal>
  );
}
