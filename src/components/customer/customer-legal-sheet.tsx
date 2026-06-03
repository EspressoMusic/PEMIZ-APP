"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Copy,
  Check,
  Accessibility,
  Shield,
  FileText,
  Gavel,
  ChevronLeft,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { CustomerLocale, CustomerTextScale } from "@/lib/customer-preferences";

function MenuTile({
  icon: Icon,
  title,
  subtitle,
  href,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
        <Icon className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1 text-start">
        <span className="block text-[16px] font-extrabold text-bakery-ink">{title}</span>
        <span className="mt-0.5 block text-[13px] font-medium leading-snug text-bakery-muted">
          {subtitle}
        </span>
      </span>
      <ChevronLeft
        className="h-6 w-6 shrink-0 text-bakery-muted rtl:rotate-180"
        strokeWidth={2}
      />
    </>
  );

  const className =
    "flex w-full items-center gap-3 rounded-[22px] bg-bakery-square px-3 py-3.5 text-start shadow-[0_3px_10px_rgba(58,47,38,0.12)] transition active:scale-[0.99]";

  if (href) {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

export function CustomerLegalSheet({
  open,
  onClose,
  storeUrl,
  locale,
  textScale,
  onTextScaleChange,
}: {
  open: boolean;
  onClose: () => void;
  storeUrl: string;
  locale: CustomerLocale;
  textScale: CustomerTextScale;
  onTextScaleChange: (scale: CustomerTextScale) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"main" | "accessibility">("main");

  const t =
    locale === "he"
      ? {
          sheetTitle: "נגישות ומשפטי",
          close: "סגור",
          accessibility: "נגישות",
          accessibilitySub: "גודל טקסט והתאמות",
          legal: "משפטי",
          privacy: "מדיניות פרטיות",
          privacySub: "טיוטת Linky",
          terms: "תנאי שימוש",
          termsSub: "טיוטת Linky גרסה 2",
          protection: "הגנה משפטית",
          protectionSub:
            "Linky הוא ספק טכנולוגיה בלבד, לא המוכר. קראו בעיון.",
          protectionBody:
            "Linky (Peymiz/Bizmi) מספקת תשתית טכנולוגית לעסקים. העסק שמופיע בעמוד זה אחראי למוצרים, מחירים, משלוחים ושירות לקוחות. השימוש בפלטפורמה כפוף לתנאים ולמדיניות הפרטיות.",
          a11yTitle: "נגישות",
          a11yHint: "בחרו גודל טקסט לעמוד החנות",
          scaleDefault: "רגיל",
          scaleLarge: "גדול",
          scaleXLarge: "גדול מאוד",
          back: "חזרה",
          copied: "הועתק",
        }
      : {
          sheetTitle: "Accessibility & legal",
          close: "Close",
          accessibility: "Accessibility",
          accessibilitySub: "Text size & adjustments",
          legal: "Legal",
          privacy: "Privacy Policy",
          privacySub: "Linky pilot draft",
          terms: "Terms of Use",
          termsSub: "Linky pilot draft v2",
          protection: "Legal protection",
          protectionSub:
            "Linky is a technology provider only, not the seller. Read carefully.",
          protectionBody:
            "Linky (Peymiz/Bizmi) provides technology for businesses. The store on this page is responsible for products, pricing, delivery, and customer service. Platform use is subject to our terms and privacy policy.",
          a11yTitle: "Accessibility",
          a11yHint: "Choose text size for this store page",
          scaleDefault: "Default",
          scaleLarge: "Large",
          scaleXLarge: "Extra large",
          back: "Back",
          copied: "Copied",
        };

  useEffect(() => {
    if (open) {
      setView("main");
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  async function copyUrl() {
    await navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const scales: { id: CustomerTextScale; label: string }[] = [
    { id: "100", label: t.scaleDefault },
    { id: "110", label: t.scaleLarge },
    { id: "125", label: t.scaleXLarge },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center lg:items-center lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t.sheetTitle}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/25 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t.close}
      />

      <div className="relative flex max-h-[min(88dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-bakery-cream-sheet shadow-[0_-8px_32px_rgba(58,47,38,0.18)] lg:max-h-[80vh] lg:rounded-[28px]">
        <div className="shrink-0 px-5 pt-3 lg:pt-5">
          <div
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-bakery-ink/20 lg:hidden"
            aria-hidden
          />
          <div className="flex items-center justify-between gap-2">
            {view === "accessibility" ? (
              <button
                type="button"
                onClick={() => setView("main")}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-semibold text-bakery-ink"
              >
                <ArrowRight className="h-5 w-5 rtl:rotate-180" strokeWidth={2} />
                {t.back}
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[15px] font-semibold text-bakery-ink transition hover:bg-bakery-card/80"
            >
              <X className="h-5 w-5" strokeWidth={2} />
              {t.close}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {view === "main" ? (
            <>
              <div className="mb-6 flex items-stretch gap-2 rounded-[22px] border-2 border-bakery-border/35 bg-bakery-cream-light p-1.5 shadow-[inset_0_1px_4px_rgba(58,47,38,0.05)]">
                <p
                  className="min-w-0 flex-1 truncate px-3 py-2.5 font-mono text-[13px] text-bakery-primary"
                  dir="ltr"
                >
                  {storeUrl}
                </p>
                <button
                  type="button"
                  onClick={copyUrl}
                  className="flex shrink-0 items-center gap-1 rounded-[16px] bg-bakery-square px-3 py-2 text-[13px] font-bold text-bakery-ink"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      {t.copied}
                    </>
                  ) : (
                    <Copy className="h-4 w-4" strokeWidth={2} />
                  )}
                </button>
              </div>

              <section>
                <h2 className="mb-3 text-[17px] font-extrabold text-bakery-ink">
                  {t.accessibility}
                </h2>
                <MenuTile
                  icon={Accessibility}
                  title={t.accessibility}
                  subtitle={t.accessibilitySub}
                  onClick={() => setView("accessibility")}
                />
              </section>

              <section className="mt-7">
                <h2 className="mb-3 text-[17px] font-extrabold text-bakery-ink">
                  {t.legal}
                </h2>
                <ul className="space-y-3">
                  <li>
                    <MenuTile
                      icon={Shield}
                      title={t.privacy}
                      subtitle={t.privacySub}
                      href="/privacy"
                    />
                  </li>
                  <li>
                    <MenuTile
                      icon={FileText}
                      title={t.terms}
                      subtitle={t.termsSub}
                      href="/terms"
                    />
                  </li>
                  <li>
                    <div className="rounded-[22px] bg-bakery-square px-3 py-3.5 shadow-[0_3px_10px_rgba(58,47,38,0.12)]">
                      <div className="flex items-center gap-3">
                        <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
                          <Gavel className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
                        </span>
                        <span className="min-w-0 flex-1 text-start">
                          <span className="block text-[16px] font-extrabold text-bakery-ink">
                            {t.protection}
                          </span>
                          <span className="mt-0.5 block text-[13px] font-medium leading-snug text-bakery-muted">
                            {t.protectionSub}
                          </span>
                        </span>
                      </div>
                      <p className="mt-3 border-t border-bakery-border/25 pt-3 text-[13px] leading-[1.5] text-bakery-ink">
                        {t.protectionBody}
                      </p>
                    </div>
                  </li>
                </ul>
              </section>
            </>
          ) : (
            <section>
              <h2 className="text-[20px] font-extrabold text-bakery-ink">{t.a11yTitle}</h2>
              <p className="mt-1 mb-4 text-[14px] text-bakery-muted">{t.a11yHint}</p>
              <ul className="space-y-2.5">
                {scales.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onTextScaleChange(s.id)}
                      className={`w-full rounded-[22px] bg-bakery-square px-4 py-3.5 text-[16px] font-extrabold text-bakery-ink shadow-[0_3px_10px_rgba(58,47,38,0.1)] ${
                        textScale === s.id
                          ? "border-2 border-bakery-ink"
                          : "border-2 border-transparent"
                      }`}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
