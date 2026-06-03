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
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  detail?: string;
  buttonLabel: string;
  closeAriaLabel?: string;
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

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-modal-title"
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

      <div className="relative w-full max-w-sm animate-[product-pop_0.45s_ease-out] rounded-[28px] border-[1.2px] border-bakery-border/40 bg-gradient-to-b from-[#fbf7ef] to-[#f3ebe0] p-8 text-center shadow-[var(--shadow-bakery-panel)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bakery-success/15 text-bakery-success">
          <Check className="h-9 w-9" strokeWidth={2.5} />
        </div>
        <h2 id="celebration-modal-title" className="text-[22px] font-extrabold text-bakery-ink">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-[15px] font-semibold text-bakery-muted">{subtitle}</p>
        )}
        {detail && (
          <p className="mt-3 text-[14px] leading-[1.45] text-bakery-muted">{detail}</p>
        )}
        <Button type="button" className="mt-6 w-full" onClick={onClose}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
