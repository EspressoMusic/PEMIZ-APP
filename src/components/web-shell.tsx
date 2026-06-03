import type { ReactNode } from "react";

export function WebShell({
  children,
  header,
  maxWidth = "max-w-[1040px]",
}: {
  children: ReactNode;
  header?: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="bakery-frame-bg min-h-full py-0 md:py-6">
      <div
        className={`mx-auto w-full ${maxWidth} bg-bakery-scaffold shadow-[var(--shadow-bakery-web)] md:rounded-none`}
      >
        {header}
        {children}
      </div>
    </div>
  );
}
