import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageTitle, Panel, Badge } from "@/components/ui";
import { DashboardSettingsBackLink } from "@/components/dashboard/dashboard-settings-back-link";
import { DEV_PREVIEW_ORDERS } from "@/lib/dev-preview-data";

export default function DevSellerSettingsOrdersPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="bakery-frame-bg min-h-screen">
      <div className="app-safe-x mx-auto w-full max-w-[1040px] py-4 sm:py-6 lg:px-[14px] lg:py-8">
        <DashboardShell businessType="STORE" basePath="/dev/seller">
          <div className="space-y-4">
            <DashboardSettingsBackLink basePath="/dev/seller" />
            <PageTitle>הזמנות קיימות</PageTitle>
            {DEV_PREVIEW_ORDERS.map((o) => (
              <Panel key={o.id}>
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="text-[17px] font-extrabold">{o.customerName}</p>
                    <p className="text-[14px]" dir="ltr">
                      {o.customerPhone}
                    </p>
                  </div>
                  <Badge>{o.statusLabel}</Badge>
                </div>
                <ul className="mt-3 text-[15px] text-bakery-muted">
                  {o.items.map((it, i) => (
                    <li key={i}>
                      {it.name} × {it.quantity} — {it.lineTotal.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </Panel>
            ))}
          </div>
        </DashboardShell>
      </div>
    </div>
  );
}
