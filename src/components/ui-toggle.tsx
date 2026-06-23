"use client";

export function Toggle({
  enabled,
  onChange,
  ariaLabel,
  disabled = false,
  className = "",
  variant = "default",
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  /** Auth forms: light track, thick brown border, brown fill when on */
  variant?: "default" | "auth";
}) {
  const isAuth = variant === "auth";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        isAuth
          ? "auth-toggle"
          : enabled
            ? "border-[3px] border-bakery-primary bg-bakery-primary shadow-[0_2px_8px_rgba(93,64,55,0.35)]"
            : "border-[3px] border-bakery-primary bg-bakery-input shadow-[inset_0_1px_2px_rgba(78,52,46,0.08)]"
      } ${className}`}
      dir="ltr"
    >
      <span
        className={`absolute top-0.5 left-0.5 h-[1.375rem] w-[1.375rem] rounded-full bg-white shadow-[0_2px_6px_rgba(58,47,38,0.22)] transition-transform duration-200 ${
          enabled
            ? "translate-x-6 border border-white/40"
            : "translate-x-0 border border-bakery-primary/15"
        }`}
      />
    </button>
  );
}
