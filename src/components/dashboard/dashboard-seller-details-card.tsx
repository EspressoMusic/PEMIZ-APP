"use client";

import { useState, type ReactNode } from "react";
import { User } from "lucide-react";
import { Badge } from "@/components/ui";
import { DASHBOARD_ACTION_ROW_CLASS } from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
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

function DashboardSellerDetailsBody({
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
  const { labels } = useAppLocale();

  return (
    <div className="overflow-hidden rounded-[20px] border border-bakery-border/35 bg-bakery-card/70 p-3 text-center shadow-[inset_0_1px_4px_rgba(58,47,38,0.06)]">
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
        className="mt-3 space-y-3 border-t border-bakery-border/25 pt-3"
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
  );
}

export function DashboardSellerDetailsCard({
  ownerName,
  email,
  phone,
  businessName,
  isActive,
  embedded = false,
}: {
  ownerName: string;
  email: string;
  phone?: string | null;
  businessName?: string;
  isActive: boolean;
  embedded?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { labels } = useAppLocale();
  const initial = ownerName.trim().charAt(0) || "?";

  const content = (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${DASHBOARD_ACTION_ROW_CLASS}${
          open ? " bakery-float-tile--active" : ""
        }`}
      >
        <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-[18px] font-extrabold text-bakery-primary">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-extrabold leading-tight text-bakery-ink">
            {labels.sellerDetails}
          </span>
          <span className="mt-0.5 block truncate text-[13px] font-medium text-bakery-muted">
            {ownerName}
          </span>
        </span>
      </button>

      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={labels.sellerDetails}
        ariaLabel={labels.sellerDetails}
        placement="center"
        showBackButton
      >
        <DashboardSellerDetailsBody
          ownerName={ownerName}
          email={email}
          phone={phone}
          businessName={businessName}
          isActive={isActive}
        />
      </DashboardActionSheet>
    </>
  );

  if (embedded) {
    return <li>{content}</li>;
  }

  return (
    <div className="dashboard-card bakery-float-panel shrink-0 rounded-[32px] p-3">
      <ul className="space-y-2 text-start">
        <li>{content}</li>
      </ul>
    </div>
  );
}
