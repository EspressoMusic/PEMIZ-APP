"use client";

import { useMemo, useState } from "react";
import {
  Shield,
  FileText,
  Gavel,
  Files,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import type { CustomerLocale, CustomerTextScale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import type {
  PlatformLegalDocId,
  PlatformLegalDocPayload,
} from "@/lib/legal/platform-legal";
import { LegalDocumentBody } from "@/components/legal/legal-document-body";
import { CustomerCenterModal } from "@/components/customer/customer-center-modal";

function MenuTile({
  icon: Icon,
  title,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[22px] bg-bakery-square px-3 py-3.5 text-start shadow-[0_3px_10px_rgba(58,47,38,0.12)] transition active:scale-[0.99]"
    >
      <span className="bakery-icon-tile flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]">
        <Icon className="h-6 w-6 text-bakery-ink" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1 text-start text-[16px] font-extrabold text-bakery-ink">
        {title}
      </span>
    </button>
  );
}

function MoreDocsTile({
  title,
  docIds,
  docMap,
  locale,
  draftNotice,
  onOpenDoc,
  storeTheme,
}: {
  title: string;
  docIds: PlatformLegalDocId[];
  docMap: Map<PlatformLegalDocId, PlatformLegalDocPayload>;
  locale: CustomerLocale;
  draftNotice: string;
  onOpenDoc: (id: PlatformLegalDocId) => void;
  storeTheme: StoreThemeId;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <MenuTile
        icon={Files}
        title={title}
        onClick={() => setModalOpen(true)}
      />
      <CustomerCenterModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        locale={locale}
        storeTheme={storeTheme}
        ariaLabel={title}
        title={title}
        panelClassName="max-h-fit"
      >
        <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="rounded-[14px] border border-bakery-border/30 bg-bakery-card px-3 py-3.5 shadow-[0_2px_8px_rgba(58,47,38,0.06)]">
            {docIds.length > 0 && (
              <ul className="space-y-2">
                {docIds.map((id) => {
                  const d = docMap.get(id);
                  if (!d) return null;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => {
                          setModalOpen(false);
                          onOpenDoc(id);
                        }}
                        className="w-full text-center text-[14px] font-semibold text-bakery-primary hover:underline"
                      >
                        {locale === "he" ? d.titleHe : d.titleEn}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p
              className={`text-center text-[12px] leading-[1.45] text-bakery-muted ${
                docIds.length > 0
                  ? "mt-3 border-t border-bakery-border/25 pt-3"
                  : ""
              }`}
            >
              {draftNotice}
            </p>
          </div>
        </div>
      </CustomerCenterModal>
    </>
  );
}

/**
 * Accessibility + legal content shown inline inside the settings tab's
 * collapsible "Settings" row. Reading a full document opens its own modal;
 * closing it returns to this inline panel (which stays expanded).
 */
export function CustomerLegalSection({
  locale,
  textScale,
  onTextScaleChange,
  storeTheme = "turquoise",
  platformLegalDocs = [],
}: {
  locale: CustomerLocale;
  textScale: CustomerTextScale;
  onTextScaleChange: (scale: CustomerTextScale) => void;
  storeTheme?: StoreThemeId;
  platformLegalDocs?: PlatformLegalDocPayload[];
}) {
  const [activeDocId, setActiveDocId] = useState<PlatformLegalDocId | null>(null);

  const t =
    locale === "he"
      ? {
          accessibility: "נגישות",
          legal: "משפטי",
          privacy: "מדיניות פרטיות",
          terms: "תנאי שימוש",
          protection: "הגנה משפטית",
          a11yStatement: "הצהרת נגישות",
          moreDocs: "מסמכים נוספים",
          draftNotice:
            "טיוטה משפטית — יש לעיין בעורך דין לפני הסתמכות. Linky מספקת כלי בלבד; בעל החנות אחראי למוצרים ולתוכן.",
          a11yHint: "בחרו גודל טקסט לעמוד החנות",
          scaleDefault: "רגיל",
          scaleLarge: "גדול",
          scaleXLarge: "גדול מאוד",
        }
      : {
          accessibility: "Accessibility",
          legal: "Legal",
          privacy: "Privacy Policy",
          terms: "Terms of Service",
          protection: "Legal protection",
          a11yStatement: "Accessibility Statement",
          moreDocs: "More documents",
          draftNotice:
            "Legal draft — consult a qualified lawyer. Linky provides the platform only; the store owner is responsible for products and content.",
          a11yHint: "Choose text size for this store page",
          scaleDefault: "Default",
          scaleLarge: "Large",
          scaleXLarge: "Extra large",
        };

  const docMap = useMemo(() => {
    const m = new Map<PlatformLegalDocId, PlatformLegalDocPayload>();
    for (const d of platformLegalDocs) m.set(d.id, d);
    return m;
  }, [platformLegalDocs]);

  const activeDoc = activeDocId ? docMap.get(activeDocId) : null;
  const extraDocIds = platformLegalDocs
    .map((d) => d.id)
    .filter(
      (id) =>
        id !== "privacy-policy" &&
        id !== "terms-of-service" &&
        id !== "disclaimer-liability" &&
        id !== "accessibility-statement"
    );

  const scales: { id: CustomerTextScale; label: string }[] = [
    { id: "100", label: t.scaleDefault },
    { id: "110", label: t.scaleLarge },
    { id: "125", label: t.scaleXLarge },
  ];

  const activeDocTitle = activeDoc
    ? locale === "he"
      ? activeDoc.titleHe
      : activeDoc.titleEn
    : undefined;

  return (
    <>
      <section>
        <h2 className="mb-3 text-center text-[17px] font-extrabold text-bakery-ink">
          {t.accessibility}
        </h2>
        <div className="rounded-[22px] bg-bakery-square px-4 py-4 shadow-[0_3px_10px_rgba(58,47,38,0.12)]">
          <p className="mb-3 text-center text-[14px] text-bakery-muted">
            {t.a11yHint}
          </p>
          <ul className="space-y-2.5">
            {scales.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onTextScaleChange(s.id)}
                  className={`w-full rounded-[16px] bg-bakery-card px-4 py-3 text-[15px] font-extrabold text-bakery-ink ${
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
        </div>
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
              onClick={() => setActiveDocId("privacy-policy")}
            />
          </li>
          <li>
            <MenuTile
              icon={FileText}
              title={t.terms}
              onClick={() => setActiveDocId("terms-of-service")}
            />
          </li>
          <li>
            <MenuTile
              icon={Gavel}
              title={t.protection}
              onClick={() => setActiveDocId("disclaimer-liability")}
            />
          </li>
          <li>
            <MenuTile
              icon={ClipboardCheck}
              title={t.a11yStatement}
              onClick={() => setActiveDocId("accessibility-statement")}
            />
          </li>
          <li>
            <MoreDocsTile
              title={t.moreDocs}
              docIds={extraDocIds}
              docMap={docMap}
              locale={locale}
              draftNotice={t.draftNotice}
              storeTheme={storeTheme}
              onOpenDoc={(id) => setActiveDocId(id)}
            />
          </li>
        </ul>
      </section>

      <CustomerCenterModal
        open={activeDoc != null}
        onClose={() => setActiveDocId(null)}
        locale={locale}
        storeTheme={storeTheme}
        placement="bottom"
        ariaLabel={activeDocTitle}
        title={activeDocTitle}
      >
        <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {activeDoc ? <LegalDocumentBody markdown={activeDoc.markdown} /> : null}
        </div>
      </CustomerCenterModal>
    </>
  );
}
