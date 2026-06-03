"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import type { CustomerLocale } from "@/lib/customer-preferences";

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
};

export function CustomerFaqSheet({
  open,
  onClose,
  items,
  locale = "en",
}: {
  open: boolean;
  onClose: () => void;
  items: FaqEntry[];
  locale?: CustomerLocale;
}) {
  const closeLabel = locale === "he" ? "סגור" : "Close";
  const emptyTitle =
    locale === "he" ? "אין שאלות ברשימה עדיין." : "No questions listed yet.";
  const emptySub =
    locale === "he"
      ? "בעל החנות עדיין לא הוסיף שאלות ותשובות."
      : "The store owner has not added FAQ entries.";
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setExpandedId(items[0]?.id ?? null);
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open, items]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center lg:items-center lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="FAQ"
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/25 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={closeLabel}
      />

      <div className="relative flex max-h-[min(88dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-[#fdf8f1] shadow-[0_-8px_32px_rgba(58,47,38,0.18)] lg:max-h-[80vh] lg:rounded-[28px]">
        <div className="shrink-0 px-5 pt-3 lg:pt-5">
          <div
            className="mx-auto mb-3 h-1 w-10 rounded-full bg-bakery-ink/20 lg:hidden"
            aria-hidden
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[15px] font-semibold text-bakery-ink transition hover:bg-bakery-card/80"
            >
              <X className="h-5 w-5" strokeWidth={2} />
              {closeLabel}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {items.length === 0 ? (
            <div className="rounded-[22px] border-[1.2px] border-bakery-border/45 bg-[#e3d5ba] px-4 py-8 text-center shadow-[0_3px_10px_rgba(58,47,38,0.1)]">
              <p className="text-[16px] font-bold text-bakery-ink">{emptyTitle}</p>
              <p className="mt-2 text-[14px] text-bakery-muted">{emptySub}</p>
            </div>
          ) : (
            <ul className="space-y-3 pb-2">
              {items.map((item) => {
                const expanded = expandedId === item.id;
                return (
                  <li key={item.id}>
                    <div className="overflow-hidden rounded-[22px] bg-[#e3d5ba] shadow-[0_3px_10px_rgba(58,47,38,0.12)]">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expanded ? null : item.id)
                        }
                        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
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
                        <p className="border-t border-bakery-border/25 px-4 pb-4 pt-3 text-[15px] leading-[1.5] text-bakery-ink">
                          {item.answer}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
