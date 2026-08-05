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
      className={`relative shrink-0 cursor-pointer rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
        isAuth ? "h-10 w-20" : "h-8 w-14"
      } ${
        isAuth
          ? "auth-toggle"
          : enabled
            ? "border-[3px] border-bakery-primary bg-bakery-primary shadow-[0_2px_8px_rgba(109,76,65,0.35)]"
            : "border-[3px] border-bakery-primary bg-bakery-input shadow-[inset_0_1px_2px_rgba(78,52,46,0.08)]"
      } ${className}`}
      dir="ltr"
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_6px_rgba(58,47,38,0.22)] transition-transform duration-200 ${
          isAuth ? "left-1.5 h-7 w-7" : "left-0.5 h-[1.375rem] w-[1.375rem]"
        } ${
          enabled
            ? `${isAuth ? "translate-x-10" : "translate-x-6"} border border-white/40`
            : "translate-x-0 border border-bakery-primary/15"
        }`}
      />
    </button>
  );
}
