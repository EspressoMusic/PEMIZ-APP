import Link from "next/link";
import type { ReactNode } from "react";
import { Panel, SquareCard, Badge } from "@/components/ui";
import { DashboardHomeGauge } from "@/components/dashboard/dashboard-home-gauge";
import { DashboardPrepSummary } from "@/components/dashboard/dashboard-prep-summary";
import type { PrepProductSummary } from "@/lib/dashboard-prep-summary";

const center = "text-center";

function HomePageTitle({ children }: { children: ReactNode }) {
  return (
    <div className={`mb-4 sm:mb-6 ${center}`}>
      <h1 className="text-[20px] font-extrabold text-bakery-ink sm:text-[22px]">
        {children}
      </h1>
    </div>
  );
}

function StatCard({
  label,
  value,
  action,
}: {
  label: string;
  value: ReactNode;
  action?: ReactNode;
}) {
  return (
    <SquareCard className="bakery-float-tile flex flex-col items-center justify-center gap-2 rounded-[20px] p-4 text-center">
      <p className="w-full text-[14px] text-bakery-muted">{label}</p>
      <div className="w-full text-[28px] font-extrabold leading-none text-bakery-ink">
        {value}
      </div>
      {action && <div className="w-full">{action}</div>}
    </SquareCard>
  );
}

export function DashboardHomeView({
  businessName,
  customerLink,
  previewHref,
  previewLabel = "תצוגה מקדימה →",
  pendingOrders,
  pendingAppointments,
  inquiries,
  isActive,
  showOrders,
  showAppointments,
  ordersHref = "/dashboard/orders",
  appointmentsHref = "/dashboard/appointments",
  inquiriesHref = "/dashboard/inquiries",
  prepProducts,
  showPrepSummary,
}: {
  businessName: string;
  customerLink: string;
  previewHref: string;
  previewLabel?: string;
  pendingOrders?: number;
  pendingAppointments?: number;
  inquiries: number;
  isActive: boolean;
  showOrders: boolean;
  showAppointments: boolean;
  ordersHref?: string;
  appointmentsHref?: string;
  inquiriesHref?: string;
  prepProducts?: PrepProductSummary[];
  showPrepSummary?: boolean;
}) {
  return (
    <div className={`flex min-h-[min(72dvh,560px)] flex-col gap-5 ${center}`}>
      <HomePageTitle>{businessName}</HomePageTitle>

      <DashboardHomeGauge percent={100} />

      {showPrepSummary && prepProducts && (
        <DashboardPrepSummary initialProducts={prepProducts} />
      )}

      <div className="grid w-full grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3">
        {showOrders && (
          <StatCard
            label="הזמנות ממתינות"
            value={pendingOrders ?? 0}
            action={
              <Link
                href={ordersHref}
                className="text-[14px] font-bold text-bakery-primary"
              >
                ניהול הזמנות
              </Link>
            }
          />
        )}
        {showAppointments && (
          <StatCard
            label="תורים ממתינים"
            value={pendingAppointments ?? 0}
            action={
              <Link
                href={appointmentsHref}
                className="text-[14px] font-bold text-bakery-primary"
              >
                ניהול תורים
              </Link>
            }
          />
        )}
        <StatCard
          label="פניות"
          value={inquiries}
          action={
            <Link
              href={inquiriesHref}
              className="text-[14px] font-bold text-bakery-primary"
            >
              צפייה בפניות
            </Link>
          }
        />
        <StatCard
          label="סטטוס"
          value={
            <Badge tone={isActive ? "success" : "danger"}>
              {isActive ? "פעיל" : "מושבת"}
            </Badge>
          }
        />
      </div>

      <div className="mt-auto w-full pt-4">
        <Panel className={`bakery-float-panel mx-auto w-full max-w-[280px] rounded-[22px] px-4 py-3.5 sm:max-w-[300px] ${center}`}>
          <h2 className="text-[16px] font-bold text-bakery-ink">קישור ללקוחות</h2>
          <p
            className="mx-auto mt-1.5 break-all font-mono text-[13px] text-bakery-primary"
            dir="ltr"
          >
            {customerLink}
          </p>
          <Link
            href={previewHref}
            className="mt-2 inline-block rounded-full border border-bakery-border/35 bg-bakery-card/80 px-3 py-1 text-[11px] font-bold text-bakery-primary underline-offset-2 transition hover:bg-bakery-primary/10 hover:underline sm:text-[12px]"
          >
            {previewLabel}
          </Link>
        </Panel>
      </div>
    </div>
  );
}
