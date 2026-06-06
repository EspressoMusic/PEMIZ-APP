"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import type { CustomerLocale } from "@/lib/customer-preferences";
import type { StoreThemeId } from "@/lib/store-themes";
import { CustomerCenterModal } from "@/components/customer/customer-center-modal";

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
};

function StoreTermsButton({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <li className="pt-2">
      <button
        type="button"
        onClick={onClick}
        className="w-full overflow-hidden rounded-full border border-bakery-border/35 bg-[#E6D5B8] px-5 py-3.5 text-center shadow-[0_3px_10px_rgba(58,47,38,0.12)] transition active:scale-[0.99]"
      >
        <span className="text-[16px] font-extrabold leading-snug text-bakery-primary">
          {title}
        </span>
      </button>
    </li>
  );
}

export function CustomerFaqSheet({
  open,
  onClose,
  items,
  storeTerms,
  locale = "en",
  storeTheme = "calm",
}: {
  open: boolean;
  onClose: () => void;
  items: FaqEntry[];
  storeTerms?: string | null;
  locale?: CustomerLocale;
  storeTheme?: StoreThemeId;
}) {
  const closeLabel = locale === "he" ? "סגור" : "Close";
  const termsTitle = locale === "he" ? "תקנון החנות" : "Store terms";
  const emptyTitle =
    locale === "he" ? "אין שאלות ברשימה עדיין." : "No questions listed yet.";
  const emptySub =
    locale === "he"
      ? "בעל החנות עדיין לא הוסיף שאלות ותשובות."
      : "The store owner has not added FAQ entries.";
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const termsBody = storeTerms?.trim() ?? "";
  const hasTerms = termsBody.length > 0;
  const hasFaq = items.length > 0;
  const hasAny = hasTerms || hasFaq;

  useEffect(() => {
    if (!open) {
      setTermsOpen(false);
      setExpandedId(null);
      return;
    }
    setExpandedId(null);
  }, [open, items]);

  return (
    <>
      <CustomerCenterModal
        open={open}
        onClose={onClose}
        locale={locale}
        storeTheme={storeTheme}
        ariaLabel="FAQ"
        header={
          <div className="flex shrink-0 justify-end border-b border-bakery-border/25 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[15px] font-semibold text-bakery-ink transition hover:bg-bakery-card/80"
            >
              <X className="h-5 w-5" strokeWidth={2} />
              {closeLabel}
            </button>
          </div>
        }
      >
        <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {!hasAny ? (
            <div className="rounded-[22px] border-[1.2px] border-bakery-border/45 bg-bakery-square px-4 py-8 text-center shadow-[0_3px_10px_rgba(58,47,38,0.1)]">
              <p className="text-[16px] font-bold text-bakery-ink">{emptyTitle}</p>
              <p className="mt-2 text-[14px] text-bakery-muted">{emptySub}</p>
            </div>
          ) : (
            <ul className="space-y-3 pb-2">
              {hasFaq
                ? items.map((item) => {
                    const expanded = expandedId === item.id;
                    return (
                      <li key={item.id}>
                        <div className="overflow-hidden rounded-[22px] bg-bakery-square shadow-[0_3px_10px_rgba(58,47,38,0.12)]">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(expanded ? null : item.id)
                            }
                            aria-expanded={expanded}
                            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-start"
                          >
                            <span className="text-[16px] font-extrabold leading-snug text-bakery-ink">
                              {item.question}
                            </span>
                            {expanded ? (
                              <ChevronUp
                                className="h-6 w-6 shrink-0 text-bakery-ink"
                                strokeWidth={2}
                              />
                            ) : (
                              <ChevronDown
                                className="h-6 w-6 shrink-0 text-bakery-ink"
                                strokeWidth={2}
                              />
                            )}
                          </button>
                          {expanded && (
                            <div className="px-3 pb-3">
                              <div className="rounded-[14px] bg-bakery-card px-4 py-3.5 text-[15px] leading-[1.5] text-bakery-ink whitespace-pre-wrap shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                                {item.answer}
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })
                : null}
              {hasTerms && (
                <StoreTermsButton
                  title={termsTitle}
                  onClick={() => setTermsOpen(true)}
                />
              )}
            </ul>
          )}
        </div>
      </CustomerCenterModal>

      <CustomerCenterModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        locale={locale}
        storeTheme={storeTheme}
        ariaLabel={termsTitle}
        panelClassName="customer-profile-modal-panel max-h-fit"
        header={
          <div className="flex shrink-0 justify-end border-b border-bakery-border/25 px-4 py-3">
            <button
              type="button"
              onClick={() => setTermsOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[15px] font-semibold text-bakery-ink transition hover:bg-bakery-card/80"
            >
              <X className="h-5 w-5" strokeWidth={2} />
              {closeLabel}
            </button>
          </div>
        }
      >
        <div className="px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="rounded-[16px] border border-bakery-border/25 bg-bakery-card px-4 py-4 shadow-[0_2px_8px_rgba(58,47,38,0.06)]">
            <p className="whitespace-pre-wrap text-start text-[15px] leading-[1.6] text-bakery-muted">
              {termsBody}
            </p>
          </div>
        </div>
      </CustomerCenterModal>
    </>
  );
}
