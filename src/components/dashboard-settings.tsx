"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Store,
  Link2,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  CircleAlert,
} from "lucide-react";
import { Button, Badge, PageTitle } from "@/components/ui";

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
  const [copied, setCopied] = useState(false);
  const initial = ownerName.trim().charAt(0) || "?";

  async function copyLink() {
    if (!storeUrl) return;
    await navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <PageTitle>
        הגדרות
      </PageTitle>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="overflow-hidden rounded-[22px] border-[1.2px] border-bakery-border/40 bg-gradient-to-b from-[#fbf7ef] to-[#f3ebe0] p-[18px] shadow-[var(--shadow-bakery-card)]">
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-bakery-border/35 bg-bakery-on-primary text-[20px] font-extrabold text-bakery-primary shadow-[0_3px_8px_rgba(58,47,38,0.12)]"
              aria-hidden
            >
              {initial}
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-bakery-muted">
                <User className="h-3.5 w-3.5" strokeWidth={2.25} />
                חשבון בעלים
              </p>
              <p className="truncate text-[20px] font-extrabold text-bakery-ink">
                {ownerName}
              </p>
              {businessName && (
                <p className="truncate text-[14px] text-bakery-muted">{businessName}</p>
              )}
            </div>
          </div>

          <dl className="space-y-0 divide-y divide-bakery-border/30">
            <SettingsRow label="אימייל">
              <span className="font-mono text-[14px] text-bakery-ink" dir="ltr">
                {email}
              </span>
            </SettingsRow>
            <SettingsRow label="סטטוס חנות">
              <Badge tone={isActive ? "success" : "danger"}>
                {isActive ? "פעילה — לקוחות יכולים להיכנס" : "מושבתת"}
              </Badge>
            </SettingsRow>
          </dl>

          {!isActive && (
            <div className="mt-4 flex gap-2 rounded-2xl border border-bakery-sale/25 bg-bakery-sale/8 px-3 py-2.5 text-[13px] leading-[1.45] text-bakery-ink">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-bakery-sale" />
              <p>
                לקוחות רואים שהעסק לא זמין. אם זה לא מכוון — פנה למנהל המערכת
                להפעלה.
              </p>
            </div>
          )}
        </section>

        {storeUrl && (
          <section className="overflow-hidden rounded-[22px] border-[1.2px] border-bakery-border/40 bg-bakery-square p-[18px] shadow-[var(--shadow-bakery-panel)]">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bakery-primary/12 text-bakery-primary">
                <Store className="h-[18px] w-[18px]" strokeWidth={2.25} />
              </span>
              <div>
                <p className="text-[15px] font-extrabold text-bakery-ink">קישור ללקוחות</p>
                <p className="text-[13px] text-bakery-muted">שתף/י בוואטסאט, אינסטגרם או QR</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-2xl border-[1.5px] border-bakery-border/40 bg-[#fffbf6] p-1 shadow-[inset_0_1px_4px_rgba(58,47,38,0.06)] sm:flex-row sm:items-stretch">
              <div className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2.5">
                <Link2 className="h-4 w-4 shrink-0 text-bakery-muted" />
                <p className="truncate font-mono text-[13px] text-bakery-primary" dir="ltr">
                  {storeUrl}
                </p>
              </div>
              <Button
                type="button"
                variant="square"
                className="w-full shrink-0 gap-1.5 px-3 sm:w-auto"
                onClick={copyLink}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    הועתק
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    העתק
                  </>
                )}
              </Button>
            </div>

            {previewSlug && (
              <Link
                href={`/b/${previewSlug}`}
                target="_blank"
                className="mt-4 inline-flex items-center gap-2 text-[14px] font-bold text-bakery-primary transition hover:text-bakery-ink"
              >
                <ExternalLink className="h-4 w-4" />
                תצוגה מקדימה של עמוד הלקוחות
              </Link>
            )}
          </section>
        )}
      </div>

      <section className="rounded-[22px] border-[1.2px] border-bakery-border/35 bg-bakery-card/80 px-[18px] py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-[15px] font-extrabold text-bakery-ink">יציאה מהמערכת</p>
            <p className="text-[13px] text-bakery-muted">סיום העבודה במכשיר זה</p>
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
            התנתקות
          </Button>
        </div>
      </section>
    </div>
  );
}

function SettingsRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <dt className="text-[13px] font-bold text-bakery-muted">{label}</dt>
      <dd className="min-w-0 text-end sm:text-start">{children}</dd>
    </div>
  );
}
