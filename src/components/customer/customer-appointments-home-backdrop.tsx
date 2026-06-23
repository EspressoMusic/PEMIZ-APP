import type { ReactNode } from "react";

/** Same fill as seller dashboard calendar (`--dashboard-panel-bg`). */
export const APPOINTMENTS_HOME_BG = "#e6d5b8";

export function CustomerAppointmentsHomeShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {children}
    </div>
  );
}
