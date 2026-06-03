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

function StoreTermsBlock({
  title,
  body,
  expanded,
  onToggle,
}: {
  title: string;
  body: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="pt-2">
      <div className="overflow-hidden rounded-full border border-bakery-primary/20 bg-bakery-border shadow-[0_3px_10px_rgba(58,47,38,0.16)]">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex w-full items-center justify-center px-5 py-3.5 text-center"
        >
          <span className="text-[16px] font-extrabold leading-snug text-bakery-ink">
            {title}
          </span>
        </button>
        {expanded && (
          <p className="whitespace-pre-wrap border-t border-bakery-border/25 px-4 pb-4 pt-3 text-start text-[15px] leading-[1.5] text-bakery-ink">
            {body}
          </p>
        )}
      </div>
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
  const faqTitle = locale === "he" ? "שאלות נפוצות" : "FAQ";
  const emptyTitle =
    locale === "he" ? "אין שאלות ברשימה עדיין." : "No questions listed yet.";
  const emptySub =
    locale === "he"
      ? "בעל החנות עדיין לא הוסיף שאלות ותשובות."
      : "The store owner has not added FAQ entries.";
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const hasTerms = !!storeTerms?.trim();
  const hasFaq = items.length > 0;
  const hasAny = hasTerms || hasFaq;

  useEffect(() => {
    if (!open) return;
    const first = items[0]?.id ?? (hasTerms ? "terms" : null);
    setExpandedId(first);
  }, [open, items, hasTerms]);

  return (
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
              {hasFaq && (
                <>
                  <li className="pb-1 text-center text-[14px] font-extrabold text-bakery-muted">
                    {faqTitle}
                  </li>
                  {items.map((item) => {
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
                            <p className="border-t border-bakery-border/25 px-4 pb-4 pt-3 text-[15px] leading-[1.5] text-bakery-ink whitespace-pre-wrap">
                              {item.answer}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </>
              )}
              {hasTerms && (
                <StoreTermsBlock
                  title={termsTitle}
                  body={storeTerms!.trim()}
                  expanded={expandedId === "terms"}
                  onToggle={() =>
                    setExpandedId(expandedId === "terms" ? null : "terms")
                  }
                />
              )}
            </ul>
          )}
        </div>
    </CustomerCenterModal>
  );
}
