"use client";

import { Alert, Panel, PageTitle } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { buildWhatsAppChatUrl } from "@/lib/phone";
import { DashboardDeleteStoreSection } from "@/components/dashboard/dashboard-delete-store-section";

const TRIAL_WHATSAPP_PHONE = "0586122187";

export function DashboardTrialPaywall({
  trialEndsAt,
  businessName,
  previewOnly = false,
}: {
  trialEndsAt: string;
  businessName?: string;
  previewOnly?: boolean;
}) {
  const { labels, locale } = useAppLocale();

  const whatsAppUrl =
    buildWhatsAppChatUrl(
      TRIAL_WHATSAPP_PHONE,
      locale === "he"
        ? `שלום, תקופת הניסיון של החנות "${businessName ?? ""}" הסתיימה ואני רוצה לסדר תשלום.`
        : `Hi, the trial for "${businessName ?? ""}" has ended and I'd like to arrange payment.`
    ) ?? `https://wa.me/972586122187`;

  return (
    <Panel>
      <PageTitle subtitle={labels.trialExpiredHint}>
        {labels.trialExpiredTitle}
      </PageTitle>

      <div className="mb-4">
        <Alert variant="error" className="text-center">
          {labels.trialExpiredTitle}
        </Alert>
      </div>

      <p className="mb-4 text-center text-[13px] font-semibold text-bakery-muted">
        {labels.trialExpiredEndedOn}{" "}
        <span dir="ltr" className="font-bold text-bakery-ink">
          {new Date(trialEndsAt).toLocaleDateString(
            locale === "he" ? "he-IL" : "en-GB"
          )}
        </span>
      </p>

      <a
        href={previewOnly ? undefined : whatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={previewOnly}
        onClick={(event) => {
          if (previewOnly) event.preventDefault();
        }}
        className="bakery-cta-3d bakery-cta-3d--primary flex w-full min-h-[48px] items-center justify-center !rounded-full text-[15px] font-extrabold aria-disabled:pointer-events-none aria-disabled:opacity-50"
      >
        {labels.trialExpiredContactWhatsApp}
      </a>
      <p className="mt-3 text-center text-[13px] font-semibold text-bakery-muted">
        {previewOnly ? labels.subscriptionPreviewOnly : labels.trialExpiredWhatsAppHint}
      </p>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-bakery-border/60" />
        <span className="text-[12px] font-bold uppercase text-bakery-muted">
          {labels.trialExpiredOrDivider}
        </span>
        <span className="h-px flex-1 bg-bakery-border/60" />
      </div>

      <p className="mb-3 text-center text-[13px] font-semibold text-bakery-muted">
        {labels.trialExpiredCloseStoreHint}
      </p>
      <DashboardDeleteStoreSection
        businessName={businessName}
        previewOnly={previewOnly}
      />
    </Panel>
  );
}
