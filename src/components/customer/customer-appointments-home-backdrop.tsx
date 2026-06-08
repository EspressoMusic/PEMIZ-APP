import type { ReactNode } from "react";

export const APPOINTMENTS_HOME_BG = "#D9C8AC";

export function CustomerAppointmentsHomeShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-6 pb-8 pt-4">
      <div className="relative flex shrink-0 flex-col items-center pt-[min(22vh,196px)]">
        {children}
      </div>
    </div>
  );
}
