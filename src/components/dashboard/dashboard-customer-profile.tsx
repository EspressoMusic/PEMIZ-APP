"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Alert, Button, Textarea } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import type { DashboardOrderView } from "@/components/dashboard/dashboard-order-card";
import {
  resolveCustomerProfile,
  type CustomerProfile,
} from "@/lib/store-customers";
import { buildWhatsAppChatUrl, normalizePhone } from "@/lib/phone";
import { appendDevStoreChat } from "@/lib/customer-chat-storage";
import type { StoreChatMessageDto } from "@/lib/store-chat";

export const CUSTOMER_DETAIL_BAR =
  "overflow-hidden rounded-[12px] border-[1.2px] border-bakery-border/35 bg-bakery-input p-4 shadow-[var(--shadow-bakery-card)]";

export function customerProfileInitial(
  name: string,
  anonymousLabel: string
) {
  const trimmed = name.trim();
  if (!trimmed || name === anonymousLabel) return "?";
  return trimmed.charAt(0);
}

export type CustomerProfileInput = {
  customerName: string;
  customerPhone: string;
  fallbackDate?: string;
};

export function DashboardCustomerProfileModal({
  profile,
  onClose,
  previewOnly = false,
  businessSlug = "demo-store",
  businessName = "",
}: {
  profile: CustomerProfile;
  onClose: () => void;
  previewOnly?: boolean;
  businessSlug?: string;
  businessName?: string;
}) {
  const { labels, formatDayDate } = useAppLocale();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  async function sendInAppMessage() {
    setError("");
    const trimmed = message.trim();
    if (!trimmed) {
      setError(labels.broadcastWriteMessage);
      return;
    }

    setSending(true);
    try {
      if (previewOnly) {
        const msg: StoreChatMessageDto = {
          id: `dev-seller-${Date.now()}`,
          channel: "SELLER",
          customerPhone: normalizePhone(profile.customerPhone),
          customerName: profile.customerName,
          authorRole: "SELLER",
          body: trimmed,
          createdAt: new Date().toISOString(),
        };
        appendDevStoreChat(businessSlug, "SELLER", msg);
        onClose();
        return;
      }

      const res = await fetch("/api/dashboard/store-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: profile.customerPhone,
          body: trimmed,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? labels.networkError);
        return;
      }
      onClose();
    } catch {
      setError(labels.networkError);
    } finally {
      setSending(false);
    }
  }

  function sendWhatsApp() {
    setError("");
    const trimmed = message.trim();
    const url = buildWhatsAppChatUrl(
      profile.customerPhone,
      trimmed || undefined
    );
    if (!url) {
      setError(labels.customerMessageInvalidPhone);
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  }

  const telHref = `tel:${profile.customerPhone.replace(/\s/g, "")}`;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={profile.customerName}
    >
      <button
        type="button"
        className="dashboard-modal-backdrop absolute inset-0"
        onClick={onClose}
        aria-label={labels.close}
      />
      <div className="dashboard-card bakery-float-panel relative w-full max-w-md overflow-hidden rounded-[32px] p-3">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-2 top-2 z-10 rounded-full p-2 text-bakery-muted transition hover:bg-bakery-card/80 hover:text-bakery-ink"
          aria-label={labels.close}
        >
          <X className="h-6 w-6" strokeWidth={2.25} />
        </button>

        <div className="space-y-2 pt-10">
          <section className={CUSTOMER_DETAIL_BAR}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-bakery-border/35 bg-bakery-on-primary text-[26px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]"
                aria-hidden
              >
                {customerProfileInitial(
                  profile.customerName,
                  labels.anonymousCustomer
                )}
              </div>
              <p className="min-w-0 flex-1 truncate text-[18px] font-extrabold leading-tight text-bakery-ink">
                {profile.customerName}
              </p>
            </div>
          </section>

          <section className={CUSTOMER_DETAIL_BAR}>
            <a
              href={telHref}
              className="block text-end text-[16px] font-extrabold text-bakery-ink underline-offset-2 hover:underline"
              dir="ltr"
            >
              {profile.customerPhone}
            </a>
          </section>

          {profile.firstOrderAt && (
            <section className={`${CUSTOMER_DETAIL_BAR} text-start`}>
              <p className="text-[12px] font-bold text-bakery-muted">
                {labels.customerJoinDate}
              </p>
              <p className="mt-1 text-[16px] font-extrabold text-bakery-ink">
                {formatDayDate(profile.firstOrderAt)}
              </p>
            </section>
          )}

          {profile.orderCount != null && (
            <section
              className={`${CUSTOMER_DETAIL_BAR} grid grid-cols-2 gap-3 text-start`}
            >
              <div>
                <p className="text-[12px] font-bold text-bakery-muted">
                  {labels.customerOrderCount}
                </p>
                <p className="mt-1 text-[16px] font-extrabold text-bakery-ink">
                  {profile.orderCount}
                </p>
              </div>
              {profile.lastOrderAt && (
                <div>
                  <p className="text-[12px] font-bold text-bakery-muted">
                    {labels.customerLastOrder}
                  </p>
                  <p className="mt-1 text-[16px] font-extrabold text-bakery-ink">
                    {formatDayDate(profile.lastOrderAt)}
                  </p>
                </div>
              )}
            </section>
          )}

          <section className={`${CUSTOMER_DETAIL_BAR} text-start`}>
            <a
              href={telHref}
              className="dashboard-inquiry-cta mb-3 block text-center no-underline"
            >
              {labels.callCustomer}
            </a>
            {error && (
              <div className="mb-3">
                <Alert variant="error">{error}</Alert>
              </div>
            )}
            <Textarea
              label={labels.broadcastMessage}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={labels.customerMessagePlaceholder}
              maxLength={500}
              className="min-h-[110px] !rounded-[12px] resize-none bg-bakery-card"
            />
            <div className="mt-3 flex flex-col gap-2">
              <Button
                type="button"
                variant="primary"
                className="w-full min-h-[48px] rounded-full font-extrabold"
                disabled={sending}
                onClick={() => void sendInAppMessage()}
              >
                {sending ? labels.sending : labels.sendCustomerMessage}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full min-h-[48px] rounded-full font-extrabold"
                onClick={sendWhatsApp}
              >
                {labels.sendCustomerWhatsApp}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function useDashboardCustomerProfile(options?: {
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
  businessSlug?: string;
  businessName?: string;
}) {
  const { labels } = useAppLocale();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<DashboardOrderView[]>(
    options?.previewOrders ?? []
  );

  useEffect(() => {
    if (options?.previewOnly) {
      setOrders(options.previewOrders ?? []);
      return;
    }

    fetch("/api/dashboard/orders")
      .then((r) => r.json())
      .then((d) => {
        if (!Array.isArray(d.orders)) return;
        setOrders(
          d.orders.map(
            (o: {
              id: string;
              customerName: string;
              customerPhone: string;
              status: string;
              createdAt: string;
            }) => ({
              id: o.id,
              customerName: o.customerName,
              customerPhone: o.customerPhone,
              status: o.status,
              statusLabel: o.status,
              createdAt: o.createdAt,
              items: [],
            })
          )
        );
      })
      .catch(() => {});
  }, [options?.previewOnly, options?.previewOrders]);

  const openCustomer = useCallback(
    (input: CustomerProfileInput) => {
      const resolved = resolveCustomerProfile(
        orders,
        input,
        labels.anonymousCustomer
      );
      if (resolved) setProfile(resolved);
    },
    [orders, labels.anonymousCustomer]
  );

  const closeCustomer = useCallback(() => setProfile(null), []);

  const modal: ReactNode = profile ? (
    <DashboardCustomerProfileModal
      profile={profile}
      onClose={closeCustomer}
      previewOnly={options?.previewOnly}
      businessSlug={options?.businessSlug}
      businessName={options?.businessName}
    />
  ) : null;

  return { openCustomer, closeCustomer, modal };
}
