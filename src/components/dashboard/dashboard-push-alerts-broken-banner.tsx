"use client";

import Link from "next/link";
import { BellOff } from "lucide-react";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

/** Persistent (non-dismissible) banner shown when alerts are flagged "on" in
 * the DB but this owner has zero registered push devices — e.g. a first-time
 * subscribe that silently failed. Stays until the seller actually fixes it
 * from Settings > Alerts, instead of being a one-time toast that can be missed. */
export function DashboardPushAlertsBrokenBanner({
  broken,
  basePath = "/dashboard",
}: {
  broken: boolean;
  basePath?: string;
}) {
  const { labels } = useAppLocale();
  if (!broken) return null;

  return (
    <div className="shrink-0 px-3 pt-2 sm:px-4">
      <Link
        href={`${basePath}/settings/alerts`}
        className="flex w-full items-center gap-3 rounded-[16px] border border-red-300/60 bg-gradient-to-b from-[#fdf1ef] to-[#f8e4e0] px-4 py-3 text-start shadow-[0_4px_14px_rgba(58,47,38,0.08)] transition hover:brightness-[1.02] active:scale-[0.99]"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-600">
          <BellOff className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-extrabold text-bakery-ink">
            {labels.pushAlertsBrokenBannerTitle}
          </span>
          <span className="mt-0.5 block text-[12px] font-semibold leading-snug text-bakery-muted">
            {labels.pushAlertsBrokenBannerHint}
          </span>
        </span>
      </Link>
    </div>
  );
}
