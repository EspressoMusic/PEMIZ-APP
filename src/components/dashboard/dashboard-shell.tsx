import type { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard-nav";

export function DashboardShell({
  children,
  businessType,
  basePath = "/dashboard",
}: {
  children: ReactNode;
  businessType: string;
  basePath?: string;
}) {
  return (
    <div className="w-full">
      <div className="min-w-0 pb-[calc(76px+env(safe-area-inset-bottom))]">
        {children}
      </div>
      <DashboardNav businessType={businessType} basePath={basePath} />
    </div>
  );
}
