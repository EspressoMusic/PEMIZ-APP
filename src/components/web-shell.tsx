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
    <div className="bakery-frame-bg py-0 sm:py-4 md:py-6">
      <div
        className={`app-safe-x mx-auto w-full ${maxWidth} bg-bakery-scaffold px-0 sm:px-2 md:px-[14px]`}
      >
        {header}
        {children}
      </div>
    </div>
  );
}
