"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, User } from "lucide-react";
import { Badge } from "@/components/ui";
import { DASHBOARD_SETTINGS_TILE_INNER } from "@/components/dashboard/dashboard-settings-bar";
import { DashboardSettingsTile } from "@/components/dashboard/dashboard-settings-tile";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold text-bakery-muted">{label}</p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

export function DashboardSellerDetailsCard({
  ownerName,
  email,
  phone,
  businessName,
  isActive,
}: {
  ownerName: string;
  email: string;
  phone?: string | null;
  businessName?: string;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();
  const initial = ownerName.trim().charAt(0) || "?";

  return (
    <DashboardSettingsTile>
      <div className="px-3 py-3.5">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className={`${DASHBOARD_SETTINGS_TILE_INNER} flex w-full min-h-11 items-center gap-3 px-3 py-2.5 transition active:scale-[0.99]`}
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-bakery-border/35 bg-bakery-on-primary text-[18px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]"
            aria-hidden
          >
            {initial}
          </div>
          <span className="min-w-0 flex-1 text-center">
            <span className="block text-[15px] font-extrabold leading-tight text-bakery-ink">
              {labels.sellerDetails}
            </span>
            <span className="mt-0.5 block truncate text-[13px] font-medium text-bakery-muted">
              {ownerName}
            </span>
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-bakery-muted transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            strokeWidth={2.5}
            aria-hidden
          />
        </button>

        {open ? (
          <div
            className={`${DASHBOARD_SETTINGS_TILE_INNER} mt-3 space-y-4 px-3 py-3 text-center`}
          >
            <div className="space-y-3">
              <p className="flex items-center justify-center gap-2 text-[12px] font-bold text-bakery-muted">
                <User className="h-3.5 w-3.5" strokeWidth={2.25} />
                {labels.ownerAccount}
              </p>
              <p className="text-[16px] font-extrabold leading-tight text-bakery-ink">
                {ownerName}
              </p>
              {businessName ? (
                <DetailField label={labels.store}>
                  <p className="text-[14px] font-semibold text-bakery-ink">
                    {businessName}
                  </p>
                </DetailField>
              ) : null}
              <DetailField label={labels.storeStatus}>
                <div className="flex justify-center">
                  <Badge tone={isActive ? "success" : "danger"}>
                    {isActive ? labels.storeActive : labels.storeInactive}
                  </Badge>
                </div>
              </DetailField>
            </div>

            <div
              className="border-t border-bakery-border/25 pt-3 space-y-3"
              aria-label={labels.accountDetails}
            >
              <DetailField label={labels.email}>
                <p className="font-mono text-[14px] text-bakery-ink" dir="ltr">
                  {email}
                </p>
              </DetailField>
              <DetailField label={labels.phone}>
                <p
                  className={`text-[14px] ${
                    phone?.trim()
                      ? "font-mono text-bakery-ink"
                      : "font-semibold text-bakery-muted"
                  }`}
                  dir="ltr"
                >
                  {phone?.trim() || labels.phoneNotSet}
                </p>
              </DetailField>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardSettingsTile>
  );
}
