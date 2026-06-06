import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";

export { Toggle } from "@/components/ui-toggle";

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[22px] border-[1.2px] border-bakery-border/40 bg-bakery-square p-4 shadow-[var(--shadow-bakery-panel)] sm:p-[18px] ${className}`}
    >
      {children}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bakery-gradient-panel rounded-[22px] border-[1.2px] border-bakery-border/40 p-4 shadow-[var(--shadow-bakery-panel)] sm:p-[18px] ${className}`}
    >
      {children}
    </div>
  );
}

export function SquareCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[20px] border-[1.2px] border-bakery-border/40 bg-bakery-square p-2 shadow-[var(--shadow-bakery-card)] ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "square" | "danger" | "ghost";
}) {
  const base =
    "inline-flex min-h-[48px] items-center justify-center rounded-[18px] px-5 py-3.5 text-[15px] font-medium transition disabled:opacity-50";
  const variants = {
    primary:
      "bg-bakery-primary text-bakery-on-primary shadow-[var(--shadow-bakery-btn)] hover:opacity-95",
    secondary:
      "border-[1.6px] border-bakery-primary bg-transparent text-bakery-ink hover:bg-bakery-card/80",
    square:
      "min-h-[48px] border-[1.2px] border-bakery-border/40 bg-bakery-square text-bakery-ink shadow-none hover:bg-bakery-card",
    danger:
      "bg-bakery-error text-white shadow-none hover:bg-[var(--bakery-error-hover)] hover:opacity-100 active:scale-[0.99]",
    ghost: "min-h-0 rounded-[14px] px-3 py-2 text-bakery-muted hover:bg-bakery-card/90",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input({
  label,
  labelClassName = "",
  error,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  labelClassName?: string;
  error?: string;
}) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span
          className={`block text-start text-[14px] font-bold text-bakery-ink ${labelClassName}`}
        >
          {label}
        </span>
      )}
      <input
        className={`bakery-field w-full rounded-2xl border-[1.5px] border-bakery-border/32 bg-bakery-input px-4 py-3 text-start text-base text-bakery-ink outline-none focus:border-[2px] focus:border-bakery-ink/70 sm:text-[15px] ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-bakery-error leading-[1.35]">{error}</span>
      )}
    </label>
  );
}

export function Textarea({
  label,
  labelClassName = "",
  error,
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  labelClassName?: string;
  error?: string;
}) {
  return (
    <label className="block space-y-1.5">
      {label && (
        <span
          className={`text-[14px] font-bold text-bakery-ink ${labelClassName}`}
        >
          {label}
        </span>
      )}
      <textarea
        className={`bakery-field w-full rounded-2xl border-[1.5px] border-bakery-border/32 bg-bakery-input px-4 py-3 text-base text-bakery-ink outline-none focus:border-[2px] focus:border-bakery-ink/70 sm:text-[15px] ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-bakery-error leading-[1.35]">{error}</span>
      )}
    </label>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "sale";
}) {
  const tones = {
    default: "bg-bakery-card text-bakery-muted",
    success: "bg-bakery-success/15 text-bakery-success",
    warning: "bg-bakery-sale/12 text-bakery-sale",
    danger: "bg-bakery-error/12 text-bakery-error",
    sale: "bg-bakery-sale/12 text-bakery-sale text-[10px] font-extrabold tracking-wide",
  };
  return (
    <span
      className={`inline-flex rounded-[5px] px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Alert({
  children,
  variant = "info",
}: {
  children: ReactNode;
  variant?: "info" | "error" | "success";
}) {
  const styles = {
    info: "border-bakery-border/40 bg-bakery-card text-bakery-ink",
    error: "border-bakery-error/30 bg-bakery-error/8 text-bakery-error",
    success: "border-bakery-success/30 bg-bakery-success/10 text-bakery-ink",
  };
  return (
    <div
      className={`rounded-2xl border-[1.2px] px-4 py-3 text-[14px] leading-[1.35] ${styles[variant]}`}
    >
      {children}
    </div>
  );
}

export function PageTitle({
  children,
  subtitle,
}: {
  children: ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 w-full text-center">
      <h1 className="text-[22px] font-extrabold text-bakery-ink">
        {children}
      </h1>
      {subtitle && (
        <p className="mt-1 text-[13px] leading-[1.45] text-bakery-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}
