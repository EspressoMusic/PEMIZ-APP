import type { ReactNode } from "react";

export const APPOINTMENTS_HOME_BG = "#f2ebe0";

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
