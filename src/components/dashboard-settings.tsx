"use client";

import { User, LogOut, CircleAlert } from "lucide-react";
import { Badge, PageTitle } from "@/components/ui";
import { DashboardCustomerLinkCard } from "@/components/dashboard/dashboard-customer-link-card";
import { DashboardDeleteStoreSection } from "@/components/dashboard/dashboard-delete-store-section";
import { DashboardSubscriptionSection } from "@/components/dashboard/dashboard-subscription-section";
import {
  DashboardSettingsTile,
  DashboardSettingsTileRow,
} from "@/components/dashboard/dashboard-settings-tile";
import { DASHBOARD_SETTINGS_ACTION } from "@/components/dashboard/dashboard-settings-bar";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

type Props = {
  ownerName: string;
  email: string;
  phone?: string | null;
  businessName?: string;
  isActive: boolean;
  storeUrl?: string;
  previewSlug?: string;
  previewOnly?: boolean;
};

export function DashboardSettingsView({
  ownerName,
  email,
  phone,
  businessName,
  isActive,
  storeUrl,
  previewSlug,
  previewOnly = false,
}: Props) {
  const { labels } = useAppLocale();
  const initial = ownerName.trim().charAt(0) || "?";

  return (
    <div className="space-y-6 pb-2">
      <PageTitle>{labels.settings}</PageTitle>

      <div className="space-y-2">
        <DashboardSettingsTile>
          <DashboardSettingsTileRow
            panel={
              <div className="flex items-center justify-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-bakery-border/35 bg-bakery-on-primary text-[18px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]"
                  aria-hidden
                >
                  {initial}
                </div>
                <div className="min-w-0 text-center">
                  <p className="flex items-center justify-center gap-2 text-[12px] font-bold text-bakery-muted">
                    <User className="h-3.5 w-3.5" strokeWidth={2.25} />
                    {labels.ownerAccount}
                  </p>
                  <p className="mt-0.5 text-[16px] font-extrabold leading-tight text-bakery-ink">
                    {ownerName}
                  </p>
                  {businessName ? (
                    <p className="text-[13px] text-bakery-muted">{businessName}</p>
                  ) : null}
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <p className="text-[11px] font-bold text-bakery-muted">
                      {labels.storeStatus}
                    </p>
                    <Badge tone={isActive ? "success" : "danger"}>
                      {isActive ? labels.storeActive : labels.storeInactive}
                    </Badge>
                  </div>
                </div>
              </div>
            }
          />
        </DashboardSettingsTile>

        <DashboardSettingsTile>
          <DashboardSettingsTileRow
            panel={
              <>
                <p className="text-[12px] font-bold text-bakery-muted">
                  {labels.accountDetails}
                </p>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="text-[11px] font-bold text-bakery-muted">
                      {labels.email}
                    </p>
                    <p
                      className="mt-0.5 font-mono text-[14px] text-bakery-ink"
                      dir="ltr"
                    >
                      {email}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-bakery-muted">
                      {labels.phone}
                    </p>
                    <p
                      className={`mt-0.5 text-[14px] ${
                        phone?.trim()
                          ? "font-mono text-bakery-ink"
                          : "font-semibold text-bakery-muted"
                      }`}
                      dir="ltr"
                    >
                      {phone?.trim() || labels.phoneNotSet}
                    </p>
                  </div>
                </div>
              </>
            }
          />
        </DashboardSettingsTile>

        {!isActive && (
          <div className="flex flex-col items-center gap-2 rounded-[22px] border border-bakery-sale/25 bg-bakery-sale/8 px-3 py-2.5 text-center text-[13px] leading-[1.45] text-bakery-ink sm:flex-row sm:justify-center">
            <CircleAlert className="h-4 w-4 shrink-0 text-bakery-sale" />
            <p>{labels.storeInactiveHint}</p>
          </div>
        )}

        {storeUrl ? (
          <DashboardCustomerLinkCard
            variant="settingsBar"
            url={storeUrl}
            previewHref={previewSlug ? `/b/${previewSlug}` : undefined}
          />
        ) : null}

        <DashboardSubscriptionSection previewOnly={previewOnly} />

        <DashboardSettingsTile>
          <DashboardSettingsTileRow
            panel={
              <p className="text-[15px] font-extrabold text-bakery-ink">
                {labels.logoutTitle}
              </p>
            }
            action={
              <button
                type="button"
                className={`${DASHBOARD_SETTINGS_ACTION} gap-1.5 border border-bakery-sale/40 bg-bakery-card/60 px-3 text-bakery-sale transition hover:bg-bakery-sale/8 active:scale-[0.99]`}
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
              >
                <LogOut className="h-4 w-4" strokeWidth={2.25} />
                <span className="text-[13px] font-extrabold">{labels.logout}</span>
              </button>
            }
          />
        </DashboardSettingsTile>

        <DashboardDeleteStoreSection
          businessName={businessName}
          previewOnly={previewOnly}
        />
      </div>
    </div>
  );
}
