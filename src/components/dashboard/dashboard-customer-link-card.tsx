"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Share2, X } from "lucide-react";
import {
  DashboardSettingsTile,
  DashboardSettingsTileRow,
} from "@/components/dashboard/dashboard-settings-tile";
import { DASHBOARD_SETTINGS_ACTION } from "@/components/dashboard/dashboard-settings-bar";
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

function resolveCustomerStoreHref(url: string, previewHref?: string): string | null {
  if (previewHref?.trim()) return previewHref.trim();
  const path = displayPath(url);
  if (path.startsWith("/b/")) return path;
  return null;
}

export function DashboardCustomerLinkCard({
  url,
  previewHref,
  variant = "compact",
  dense = false,
}: {
  url: string;
  previewHref?: string;
  variant?: "compact" | "settingsBar";
  dense?: boolean;
}) {
  const { labels } = useAppLocale();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [absoluteUrl, setAbsoluteUrl] = useState(url);
  const pathLabel = displayPath(url);
  const customerStoreHref = resolveCustomerStoreHref(url, previewHref);

  useEffect(() => {
    setAbsoluteUrl(toAbsoluteUrl(url));
  }, [url]);

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

  async function shareUrl() {
    const link = toAbsoluteUrl(url);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url: link, title: labels.shareStoreLink });
        setOpen(false);
        return;
      } catch {
        return;
      }
    }

    const whatsappShare = `https://wa.me/?text=${encodeURIComponent(link)}`;
    window.open(whatsappShare, "_blank", "noopener,noreferrer");
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
        className="dashboard-modal-backdrop absolute inset-0"
        onClick={closeSheet}
        aria-label={labels.close}
      />
      <div className="dashboard-modal-card relative w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-end border-b border-bakery-border/25 px-4 py-2">
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
            className="dashboard-share-tile truncate rounded-[9999px] px-4 py-3 text-center font-mono text-[12px] font-semibold text-bakery-ink"
            dir="ltr"
          >
            {absoluteUrl}
          </p>

          <button
            type="button"
            onClick={() => void copyUrl()}
            className="dashboard-share-tile flex w-full min-h-[52px] items-center justify-center gap-2 rounded-[9999px] px-4 py-3 text-[15px] font-extrabold text-bakery-ink transition active:scale-[0.99]"
          >
            {copied ? (
              <Check className="h-5 w-5 text-bakery-success" strokeWidth={2.5} />
            ) : (
              <Copy className="h-5 w-5" strokeWidth={2} />
            )}
            {copied ? labels.copied : labels.copyLink}
          </button>

          <button
            type="button"
            onClick={() => void shareUrl()}
            className="dashboard-share-tile flex w-full min-h-[52px] items-center justify-center gap-2 rounded-[9999px] px-4 py-3 text-[15px] font-extrabold text-bakery-ink transition active:scale-[0.99]"
          >
            <Share2 className="h-5 w-5" strokeWidth={2} />
            {labels.shareStoreLink}
          </button>

          {customerStoreHref ? (
            <Link
              href={customerStoreHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeSheet}
              className="dashboard-share-tile flex w-full min-h-[52px] items-center justify-center gap-2 rounded-[9999px] px-4 py-3 text-[15px] font-extrabold text-bakery-ink transition hover:opacity-95 active:scale-[0.99]"
            >
              <ExternalLink className="h-5 w-5" strokeWidth={2} />
              {labels.viewCustomerSide}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  ) : null;

  if (isSettingsBar) {
    return (
      <>
        <DashboardSettingsTile>
          <DashboardSettingsTileRow
            panel={
              <>
                <p className="text-[15px] font-extrabold text-bakery-ink">
                  {labels.shareStoreLink}
                </p>
              </>
            }
            action={
              <button
                type="button"
                onClick={() => setOpen(true)}
                className={`${DASHBOARD_SETTINGS_ACTION} min-w-[7.5rem] max-w-[11rem] border border-bakery-border/35 bg-bakery-card/60 px-3 font-mono text-[12px] font-semibold text-bakery-ink transition active:scale-[0.99]`}
                dir="ltr"
                aria-label={labels.shareStoreLink}
              >
                <span className="block truncate">{pathLabel}</span>
              </button>
            }
          />
        </DashboardSettingsTile>
        {shareSheet}
      </>
    );
  }

  return (
    <>
      <div
        className={
          dense
            ? "dashboard-home-header dashboard-home-header--compact"
            : "dashboard-home-header"
        }
      >
        <div
          className={`dashboard-home-header__inner text-center ${
            dense ? "px-2.5 py-2" : "px-3 py-3.5"
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={
              dense
                ? "dashboard-home-store-link dashboard-home-store-link--compact"
                : "dashboard-home-store-link"
            }
            aria-label={labels.storeLinkBarLabel}
          >
            <span
              className={`block min-w-0 truncate font-extrabold ${
                dense ? "text-[17px] sm:text-[18px]" : "text-[19px] sm:text-[20px]"
              }`}
            >
              {labels.storeLinkBarLabel}
            </span>
          </button>
        </div>
      </div>

      {shareSheet}
    </>
  );
}
