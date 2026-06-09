"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MessageSquare, Phone, X } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import type { DashboardOrderView } from "@/components/dashboard/dashboard-order-card";
import {
  resolveCustomerProfile,
  type CustomerProfile,
} from "@/lib/store-customers";
import { buildWhatsAppChatUrl, isValidPhone } from "@/lib/phone";

export const CUSTOMER_DETAIL_BAR =
  "overflow-hidden rounded-[12px] border-[1.2px] border-bakery-border/35 bg-[#F2EBE0] p-4 shadow-[var(--shadow-bakery-card)]";

const CONTACT_ICON_BTN =
  "flex h-12 w-12 items-center justify-center rounded-full text-bakery-primary transition hover:bg-bakery-card/40 active:scale-95";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
}: {
  profile: CustomerProfile;
  onClose: () => void;
}) {
  const { labels, formatDayDate } = useAppLocale();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const phoneDigits = profile.customerPhone.replace(/\s/g, "");
  const telHref = `tel:${phoneDigits}`;
  const smsHref = `sms:${phoneDigits}`;
  const whatsappHref = buildWhatsAppChatUrl(profile.customerPhone);
  const phoneValid = isValidPhone(profile.customerPhone);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
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
      <div className="dashboard-surface dashboard-card relative w-full max-w-md overflow-hidden rounded-[32px] border-[1.2px] border-bakery-border/35 bg-[#E6D5B8] p-3 shadow-[var(--shadow-bakery-panel)]">
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

          <section className={CUSTOMER_DETAIL_BAR}>
            <div className="flex items-center justify-center gap-8">
              <a
                href={phoneValid ? telHref : undefined}
                aria-label={labels.callCustomer}
                className={`${CONTACT_ICON_BTN} ${phoneValid ? "" : "pointer-events-none opacity-40"}`}
              >
                <Phone className="h-6 w-6" strokeWidth={2.25} />
              </a>
              <a
                href={phoneValid ? smsHref : undefined}
                aria-label={labels.openCustomerMessageComposer}
                className={`${CONTACT_ICON_BTN} ${phoneValid ? "" : "pointer-events-none opacity-40"}`}
              >
                <MessageSquare className="h-6 w-6" strokeWidth={2.25} />
              </a>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={labels.sendCustomerWhatsApp}
                  className={CONTACT_ICON_BTN}
                >
                  <WhatsAppIcon className="h-6 w-6" />
                </a>
              ) : (
                <span
                  className={`${CONTACT_ICON_BTN} opacity-40`}
                  aria-hidden
                >
                  <WhatsAppIcon className="h-6 w-6" />
                </span>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body
  );
}

type CustomerOrderSource = {
  customerName: string;
  customerPhone: string;
  createdAt?: string;
  status: string;
};

export function useDashboardCustomerProfile(options?: {
  previewOnly?: boolean;
  previewOrders?: DashboardOrderView[];
  /** Merged with fetched orders — e.g. appointment history for profile stats. */
  supplementalOrderSources?: CustomerOrderSource[];
  businessSlug?: string;
  businessName?: string;
}) {
  const { labels } = useAppLocale();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<DashboardOrderView[]>(
    options?.previewOrders ?? []
  );

  useEffect(() => {
    if (options?.previewOnly) return;

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
  }, [options?.previewOnly]);

  const effectiveOrders = options?.previewOnly
    ? (options.previewOrders ?? [])
    : orders;

  const openCustomer = useCallback(
    (input: CustomerProfileInput) => {
      const mergedSources: CustomerOrderSource[] = [
        ...effectiveOrders.map((order) => ({
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          createdAt: order.createdAt,
          status: order.status,
        })),
        ...(options?.supplementalOrderSources ?? []),
      ];
      const resolved = resolveCustomerProfile(
        mergedSources,
        input,
        labels.anonymousCustomer
      );
      if (resolved) setProfile(resolved);
    },
    [effectiveOrders, options?.supplementalOrderSources, labels.anonymousCustomer]
  );

  const closeCustomer = useCallback(() => setProfile(null), []);

  const modal: ReactNode = profile ? (
    <DashboardCustomerProfileModal profile={profile} onClose={closeCustomer} />
  ) : null;

  return { openCustomer, closeCustomer, modal };
}
