"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DEV_RENTAL_SELLER_SHELL } from "@/lib/dev-preview-data";

export function DevRentalSellerShell({ children }: { children: ReactNode }) {
  const shell = DEV_RENTAL_SELLER_SHELL;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <DashboardShell
        businessType={shell.businessType}
        basePath={shell.basePath}
        storeLocale={shell.storeLocale}
        storeTheme={shell.storeTheme}
      >
        <p className="mb-1 shrink-0 rounded-[12px] border border-bakery-primary/20 bg-bakery-card/70 px-2.5 py-1 text-center text-[10px] font-bold leading-snug text-bakery-muted">
          חנות השכרה — תצוגת דמו נפרדת ממוצרים ומפגישות
        </p>
        {children}
      </DashboardShell>
    </div>
  );
}
