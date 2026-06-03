"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, Share2, X } from "lucide-react";
import {
  DASHBOARD_SETTINGS_BAR,
  DASHBOARD_SETTINGS_BAR_INNER,
} from "@/components/dashboard/dashboard-settings-bar";
import { DashboardHelpText } from "@/components/dashboard/dashboard-ui-preferences";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

function toAbsoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  if (typeof window === "undefined") return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${window.location.origin}${path}`;
}

function displayPath(url: string): string {
  try {
    if (/^https?:\/\//i.test(url)) return new URL(url).pathname;
  } catch {
    /* ignore */
  }
  return url;
}

const SOCIAL_SHARE = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: (link: string) =>
      `https://wa.me/?text=${encodeURIComponent(link)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    href: (link: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    href: (link: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(link)}`,
  },
] as const;

const RECT_COMPACT =
  "flex w-full flex-col overflow-hidden rounded-[12px] border-[1.2px] border-bakery-border/35 bg-bakery-card p-3 shadow-[var(--shadow-bakery-card)]";

export function DashboardCustomerLinkCard({
  url,
  previewHref,
  variant = "compact",
}: {
  url: string;
  previewHref?: string;
  variant?: "compact" | "settingsBar";
}) {
  const { labels } = useAppLocale();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  const pathLabel = displayPath(url);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function copyUrl() {
    const link = toAbsoluteUrl(url);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function nativeShare() {
    const link = toAbsoluteUrl(url);
    try {
      await navigator.share({ url: link, title: labels.shareStoreLink });
      setOpen(false);
    } catch {
      /* cancelled or unsupported */
    }
  }

  function closeSheet() {
    setOpen(false);
  }

  const isSettingsBar = variant === "settingsBar";

  const shareSheet = open ? (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={labels.shareStoreLink}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/30 backdrop-blur-[2px]"
        onClick={closeSheet}
        aria-label={labels.close}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-bakery-border/30 bg-bakery-cream-sheet shadow-[0_12px_40px_rgba(58,47,38,0.2)]">
        <div className="flex items-center justify-between border-b border-bakery-border/25 px-4 py-3">
          <h2 className="text-[18px] font-extrabold text-bakery-ink">
            {labels.shareStoreLink}
          </h2>
          <button
            type="button"
            onClick={closeSheet}
            className="rounded-full p-2 text-bakery-muted hover:bg-bakery-primary/10"
            aria-label={labels.close}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <p
            className="truncate rounded-[14px] bg-bakery-cream-light px-3 py-2.5 text-center font-mono text-[12px] font-semibold text-bakery-muted"
            dir="ltr"
          >
            {toAbsoluteUrl(url)}
          </p>

          <button
            type="button"
            onClick={() => void copyUrl()}
            className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-bakery-border/30 bg-bakery-card px-4 py-3 text-[15px] font-extrabold text-bakery-ink transition hover:bg-bakery-cream-hover active:scale-[0.99]"
          >
            {copied ? (
              <Check className="h-5 w-5 text-bakery-success" strokeWidth={2.5} />
            ) : (
              <Copy className="h-5 w-5" strokeWidth={2} />
            )}
            {copied ? labels.copied : labels.copyLink}
          </button>

          {canNativeShare && (
            <button
              type="button"
              onClick={() => void nativeShare()}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-bakery-border/30 bg-bakery-card px-4 py-3 text-[15px] font-extrabold text-bakery-ink transition hover:bg-bakery-cream-hover active:scale-[0.99]"
            >
              <Share2 className="h-5 w-5" strokeWidth={2} />
              {labels.shareStoreLink}
            </button>
          )}

          <div className="grid grid-cols-3 gap-2">
            {SOCIAL_SHARE.map((item) => (
              <a
                key={item.id}
                href={item.href(toAbsoluteUrl(url))}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeSheet}
                className="rounded-[16px] border border-bakery-border/30 bg-bakery-card px-2 py-3 text-center text-[13px] font-extrabold text-bakery-ink transition hover:bg-bakery-cream-hover active:scale-[0.98]"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  if (isSettingsBar) {
    return (
      <>
        <section className={DASHBOARD_SETTINGS_BAR}>
          <div className={DASHBOARD_SETTINGS_BAR_INNER}>
            <div className="min-w-0 text-start">
              <p className="text-[15px] font-extrabold text-bakery-ink">
                {labels.shareStoreLink}
              </p>
              <DashboardHelpText>
                <p className="text-[13px] text-bakery-muted">
                  {labels.copyLink}
                </p>
              </DashboardHelpText>
              {previewHref && (
                <DashboardHelpText>
                  <Link
                    href={previewHref}
                    target={previewHref.startsWith("http") ? "_blank" : undefined}
                    className="mt-1 inline-block text-[12px] font-bold text-bakery-primary hover:underline"
                  >
                    {labels.customerPreview}
                  </Link>
                </DashboardHelpText>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full min-w-0 rounded-[12px] border border-bakery-border/30 bg-bakery-cream-light px-4 py-3 font-mono text-[13px] font-semibold text-bakery-ink transition hover:bg-bakery-cream-hover active:scale-[0.99] sm:max-w-[220px] sm:shrink-0"
              dir="ltr"
              aria-label={labels.shareStoreLink}
            >
              <span className="block truncate">{pathLabel}</span>
            </button>
          </div>
        </section>
        {shareSheet}
      </>
    );
  }

  return (
    <section className={RECT_COMPACT}>
      <DashboardHelpText>
        <p className="mb-1.5 text-center text-[12px] font-bold text-bakery-muted">
          {labels.shareStoreLink}
        </p>
      </DashboardHelpText>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center rounded-[10px] border border-bakery-border/25 bg-bakery-cream-light px-3 py-2.5 transition hover:bg-bakery-cream-hover active:scale-[0.99]"
        aria-label={labels.shareStoreLink}
      >
        <p
          className="min-w-0 truncate text-center font-mono text-[11px] font-semibold text-bakery-ink sm:text-[12px]"
          dir="ltr"
        >
          {pathLabel}
        </p>
      </button>

      {previewHref && (
        <DashboardHelpText>
          <Link
            href={previewHref}
            target={previewHref.startsWith("http") ? "_blank" : undefined}
            className="mt-1.5 block text-center text-[11px] font-bold text-bakery-primary hover:underline"
          >
            {labels.customerPreview}
          </Link>
        </DashboardHelpText>
      )}

      {shareSheet}
    </section>
  );
}
