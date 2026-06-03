"use client";

import { User, LogOut, CircleAlert } from "lucide-react";
import { Button, Badge, PageTitle } from "@/components/ui";
import { DashboardCustomerLinkCard } from "@/components/dashboard/dashboard-customer-link-card";
import { DashboardDeleteStoreSection } from "@/components/dashboard/dashboard-delete-store-section";
import {
  DASHBOARD_SETTINGS_BAR,
  DASHBOARD_SETTINGS_BAR_INNER,
} from "@/components/dashboard/dashboard-settings-bar";
import {
  DashboardHelpText,
  DashboardHelpTextToggle,
} from "@/components/dashboard/dashboard-ui-preferences";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

type Props = {
  ownerName: string;
  email: string;
  businessName?: string;
  isActive: boolean;
  storeUrl?: string;
  previewSlug?: string;
  previewOnly?: boolean;
};

export function DashboardSettingsView({
  ownerName,
  email,
  businessName,
  isActive,
  storeUrl,
  previewSlug,
  previewOnly = false,
}: Props) {
  const { labels } = useAppLocale();
  const initial = ownerName.trim().charAt(0) || "?";

  return (
    <div className="space-y-6">
      <PageTitle>{labels.settings}</PageTitle>

      <DashboardHelpTextToggle />

      <div className="space-y-4">
        <section className={DASHBOARD_SETTINGS_BAR}>
          <div className={DASHBOARD_SETTINGS_BAR_INNER}>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-bakery-border/35 bg-bakery-on-primary text-[20px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]"
                aria-hidden
              >
                {initial}
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-bakery-muted">
                  <User className="h-3.5 w-3.5" strokeWidth={2.25} />
                  {labels.ownerAccount}
                </p>
                <p className="truncate text-[18px] font-extrabold text-bakery-ink sm:text-[20px]">
                  {ownerName}
                </p>
                {businessName && (
                  <p className="truncate text-[14px] text-bakery-muted">
                    {businessName}
                  </p>
                )}
              </div>
            </div>
            <dl className="w-full shrink-0 space-y-2 sm:w-auto sm:min-w-[200px] sm:text-end">
              <div>
                <dt className="text-[12px] font-bold text-bakery-muted">
                  {labels.email}
                </dt>
                <dd className="font-mono text-[14px] text-bakery-ink" dir="ltr">
                  {email}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] font-bold text-bakery-muted">
                  {labels.storeStatus}
                </dt>
                <dd className="mt-0.5">
                  <Badge tone={isActive ? "success" : "danger"}>
                    {isActive ? labels.storeActive : labels.storeInactive}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>
          {!isActive && (
            <div className="mt-4 flex gap-2 rounded-[12px] border border-bakery-sale/25 bg-bakery-sale/8 px-3 py-2.5 text-[13px] leading-[1.45] text-bakery-ink">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-bakery-sale" />
              <p>{labels.storeInactiveHint}</p>
            </div>
          )}
        </section>

        {storeUrl && (
          <DashboardCustomerLinkCard
            variant="settingsBar"
            url={storeUrl}
            previewHref={previewSlug ? `/b/${previewSlug}` : undefined}
          />
        )}
      </div>

      <section className={DASHBOARD_SETTINGS_BAR}>
        <div className={DASHBOARD_SETTINGS_BAR_INNER}>
          <div>
            <p className="text-[15px] font-extrabold text-bakery-ink">
              {labels.logoutTitle}
            </p>
            <DashboardHelpText>
              <p className="text-[13px] text-bakery-muted">{labels.logoutHint}</p>
            </DashboardHelpText>
          </div>
          <Button
            variant="secondary"
            className="w-full gap-2 border-bakery-sale/40 text-bakery-sale hover:bg-bakery-sale/8 sm:w-auto"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
          >
            <LogOut className="h-4 w-4" />
            {labels.logout}
          </Button>
        </div>
      </section>

      <DashboardDeleteStoreSection
        businessName={businessName}
        previewOnly={previewOnly}
      />
    </div>
  );
}
