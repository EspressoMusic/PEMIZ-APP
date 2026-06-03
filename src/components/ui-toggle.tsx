"use client";

export function Toggle({
  enabled,
  onChange,
  ariaLabel,
  disabled = false,
  className = "",
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        enabled ? "bg-bakery-primary" : "bg-bakery-border/45"
      } ${className}`}
      dir="ltr"
    >
      <span
        className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-bakery-cream-light shadow-[0_2px_6px_rgba(58,47,38,0.2)] transition-transform duration-200 ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}
