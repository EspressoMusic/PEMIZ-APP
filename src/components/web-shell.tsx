import type { ReactNode } from "react";

export function WebShell({
  children,
  header,
  maxWidth = "max-w-[1040px]",
  lockViewport = false,
}: {
  children: ReactNode;
  header?: ReactNode;
  maxWidth?: string;
  /** Auth pages: one screen, no vertical scroll */
  lockViewport?: boolean;
}) {
  return (
    <div
      className={`bakery-frame-bg ${
        lockViewport
          ? "flex h-full min-h-0 flex-col overflow-hidden py-0"
          : "py-0 sm:py-4 md:py-6"
      }`}
    >
      <div
        className={`app-safe-x mx-auto w-full ${maxWidth} bg-bakery-scaffold px-0 sm:px-2 md:px-[14px] ${
          lockViewport ? "flex min-h-0 flex-1 flex-col overflow-hidden" : ""
        }`}
      >
        {header}
        {children}
      </div>
    </div>
  );
}
