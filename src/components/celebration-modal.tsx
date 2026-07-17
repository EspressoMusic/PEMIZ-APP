"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { useDialogA11y } from "@/hooks/use-dialog-a11y";
type Piece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
};

function AnimatedSuccessCheck({
  tone,
  icon,
}: {
  tone: "default" | "calendar";
  /** Replaces the checkmark with a custom icon (e.g. "sent" instead of "done") inside the same badge circle. */
  icon?: ReactNode;
}) {
  const isCalendar = tone === "calendar";
  const size = isCalendar ? 56 : 64;

  if (icon) {
    return (
      <div
        className={`celebration-check-wrap ${isCalendar ? "celebration-check-wrap--calendar mb-3" : "mb-4"}`}
        aria-hidden
      >
        <div
          className="mx-auto flex items-center justify-center rounded-full text-bakery-primary"
          style={{
            width: size,
            height: size,
            backgroundColor: `color-mix(in srgb, var(--bakery-primary) ${isCalendar ? 12 : 15}%, transparent)`,
          }}
        >
          {icon}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`celebration-check-wrap ${isCalendar ? "celebration-check-wrap--calendar mb-3" : "mb-4"}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 72 72"
        width={size}
        height={size}
        className="celebration-check-svg mx-auto"
      >
        <circle
          className="celebration-check-circle"
          cx="36"
          cy="36"
          r="32"
          fill={isCalendar ? "rgba(67,160,71,0.12)" : "rgba(67,160,71,0.15)"}
        />
        <path
          className="celebration-check-mark"
          d="M22 37 L32 47 L50 27"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

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
  icon,
  celebrate = true,
  children,
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
  /** Replaces the default checkmark badge with a custom icon (e.g. "sent" instead of "done"). */
  icon?: ReactNode;
  /** Set false for non-celebratory outcomes (e.g. a declined order) to skip the confetti. */
  celebrate?: boolean;
  children?: ReactNode;
}) {
  const pieces = useMemo<Piece[]>(() => {
    if (!celebrate) return [];
    const colors = ["#e6d4b8", "#6d4c41", "#43a047", "#b94040", "#7eb8ff", "#f4f0e8"];
    return Array.from({ length: 56 }, (_, id) => ({
      id,
      left: Math.random() * 100,
      delay: Math.random() * 0.45,
      duration: 1.8 + Math.random() * 1.2,
      color: colors[id % colors.length]!,
      size: 6 + Math.floor(Math.random() * 8),
    }));
  }, [open, celebrate]);

  const panelRef = useDialogA11y<HTMLDivElement>(open, onClose);

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
    <AnimatedSuccessCheck tone={isCalendar ? "calendar" : "default"} icon={icon} />
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
      {children ? <div className="mt-4">{children}</div> : null}
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

      {celebrate ? (
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
      ) : null}

      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative w-full max-w-sm animate-[product-pop_0.45s_ease-out] text-center outline-none shadow-[var(--shadow-bakery-panel)] ${
          isCalendar
            ? "rounded-[24px] border-[3px] border-[#6d4c41] bg-[#e6d5b8] p-4"
            : "rounded-[28px] border-[1.2px] border-bakery-border/40 bg-gradient-to-b from-bakery-cream-light to-bakery-cream-mid p-8"
        }`}
      >
        {isCalendar ? (
          <div className="rounded-[18px] border border-[#6D4C41]/14 bg-[#fffdf8] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
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
