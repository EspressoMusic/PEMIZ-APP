"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Accessibility,
  Shield,
  FileText,
  Gavel,
  ArrowRight,
  X,
  type LucideIcon,
} from "lucide-react";
import type { CustomerLocale, CustomerTextScale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import {
  CustomerCenterModal,
  CustomerModalHeaderBar,
} from "@/components/customer/customer-center-modal";

function MenuTile({
  icon: Icon,
  title,
  href,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
        <Icon className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1 text-start text-[16px] font-extrabold text-bakery-ink">
        {title}
      </span>
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
  locale,
  textScale,
  onTextScaleChange,
  storeTheme = "calm",
}: {
  open: boolean;
  onClose: () => void;
  locale: CustomerLocale;
  textScale: CustomerTextScale;
  onTextScaleChange: (scale: CustomerTextScale) => void;
  storeTheme?: StoreThemeId;
}) {
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
          a11yTitle: "נגישות",
          a11yHint: "בחרו גודל טקסט לעמוד החנות",
          scaleDefault: "רגיל",
          scaleLarge: "גדול",
          scaleXLarge: "גדול מאוד",
          back: "חזרה",
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
          a11yTitle: "Accessibility",
          a11yHint: "Choose text size for this store page",
          scaleDefault: "Default",
          scaleLarge: "Large",
          scaleXLarge: "Extra large",
          back: "Back",
        };

  useEffect(() => {
    if (open) setView("main");
  }, [open]);

  const scales: { id: CustomerTextScale; label: string }[] = [
    { id: "100", label: t.scaleDefault },
    { id: "110", label: t.scaleLarge },
    { id: "125", label: t.scaleXLarge },
  ];

  return (
    <CustomerCenterModal
      open={open}
      onClose={onClose}
      locale={locale}
      storeTheme={storeTheme}
      ariaLabel={t.sheetTitle}
      header={
        view === "accessibility" ? (
          <CustomerModalHeaderBar
            title={t.a11yTitle}
            onClose={onClose}
            closeLabel={t.close}
            leading={
              <button
                type="button"
                onClick={() => setView("main")}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-semibold text-bakery-ink"
              >
                <ArrowRight className="h-5 w-5 rtl:rotate-180" strokeWidth={2} />
                {t.back}
              </button>
            }
          />
        ) : (
          <div className="flex shrink-0 justify-end border-b border-bakery-border/25 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[15px] font-semibold text-bakery-ink transition hover:bg-bakery-card/80"
            >
              <X className="h-5 w-5" strokeWidth={2} />
              {t.close}
            </button>
          </div>
        )
      }
    >
        <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {view === "main" ? (
            <>
              <section>
                <h2 className="mb-3 text-center text-[17px] font-extrabold text-bakery-ink">
                  {t.accessibility}
                </h2>
                <MenuTile
                  icon={Accessibility}
                  title={t.accessibility}
                  onClick={() => setView("accessibility")}
                />
              </section>

              <section className="mt-5">
                <h2 className="mb-3 text-center text-[17px] font-extrabold text-bakery-ink">
                  {t.legal}
                </h2>
                <ul className="space-y-3">
                  <li>
                    <MenuTile
                      icon={Shield}
                      title={t.privacy}
                      href="/privacy"
                    />
                  </li>
                  <li>
                    <MenuTile
                      icon={FileText}
                      title={t.terms}
                      href="/terms"
                    />
                  </li>
                  <li>
                    <div className="flex items-center gap-3 rounded-[22px] bg-bakery-square px-3 py-3.5 shadow-[0_3px_10px_rgba(58,47,38,0.12)]">
                      <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
                        <Gavel className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
                      </span>
                      <span className="text-[16px] font-extrabold text-bakery-ink">
                        {t.protection}
                      </span>
                    </div>
                  </li>
                </ul>
              </section>
            </>
          ) : (
            <section>
              <p className="mb-4 text-center text-[14px] text-bakery-muted">{t.a11yHint}</p>
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
    </CustomerCenterModal>
  );
}
