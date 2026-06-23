"use client";

import { useEffect, useMemo } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui";
type Piece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
};

export function CelebrationModal({
  open,
  onClose,
  title,
  subtitle,
  detail,
  buttonLabel,
  closeAriaLabel = "Close",
  locale,
  tone = "default",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  detail?: string;
  buttonLabel: string;
  closeAriaLabel?: string;
  locale?: "he" | "en";
  /** Cream board + light inner card — matches appointments calendar. */
  tone?: "default" | "calendar";
}) {
  const pieces = useMemo<Piece[]>(() => {
    const colors = ["#e6d4b8", "#5c4a3e", "#43a047", "#b94040", "#7eb8ff", "#f4f0e8"];
    return Array.from({ length: 56 }, (_, id) => ({
      id,
      left: Math.random() * 100,
      delay: Math.random() * 0.45,
      duration: 1.8 + Math.random() * 1.2,
      color: colors[id % colors.length]!,
      size: 6 + Math.floor(Math.random() * 8),
    }));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const dir = locale === "he" ? "rtl" : "ltr";
  const lang = locale === "he" ? "he" : "en";
  const isCalendar = tone === "calendar";

  const iconBlock = (
    <div
      className={`mx-auto flex items-center justify-center rounded-full ${
        isCalendar
          ? "mb-3 h-14 w-14 bg-bakery-success/12 text-bakery-primary"
          : "mb-4 h-16 w-16 bg-bakery-success/15 text-bakery-success"
      }`}
    >
      <Check
        className={isCalendar ? "h-8 w-8" : "h-9 w-9"}
        strokeWidth={2.5}
      />
    </div>
  );

  const textBlock = (
    <>
      <h2
        id="celebration-modal-title"
        className={`font-extrabold text-bakery-ink ${
          isCalendar ? "text-[20px] leading-tight" : "text-[22px]"
        }`}
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={`font-semibold text-bakery-muted ${
            isCalendar ? "mt-2 text-[14px]" : "mt-2 text-[15px]"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
      {detail ? (
        <p
          className={`leading-[1.45] text-bakery-muted ${
            isCalendar ? "mt-2.5 text-[13px]" : "mt-3 text-[14px]"
          }`}
        >
          {detail}
        </p>
      ) : null}
    </>
  );

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-modal-title"
      dir={dir}
      lang={lang}
    >
      <button
        type="button"
        className="absolute inset-0 bg-bakery-ink/35 backdrop-blur-[3px]"
        onClick={onClose}
        aria-label={closeAriaLabel}
      />

      <div className="confetti-layer pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {pieces.map((p) => (
          <span
            key={p.id}
            className="confetti-piece"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 1.4,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <div
        className={`relative w-full max-w-sm animate-[product-pop_0.45s_ease-out] text-center shadow-[var(--shadow-bakery-panel)] ${
          isCalendar
            ? "rounded-[24px] border-[3px] border-[#5d4037] bg-[#e6d5b8] p-4"
            : "rounded-[28px] border-[1.2px] border-bakery-border/40 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-mid p-8"
        }`}
      >
        {isCalendar ? (
          <div className="rounded-[18px] border border-[#5C4A3E]/14 bg-[#fffdf8] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            {iconBlock}
            {textBlock}
          </div>
        ) : (
          <>
            {iconBlock}
            {textBlock}
          </>
        )}
        <Button
          type="button"
          className={`w-full ${isCalendar ? "mt-4" : "mt-6"}`}
          onClick={onClose}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
