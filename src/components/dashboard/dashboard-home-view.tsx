import Link from "next/link";
import type { ReactNode } from "react";
import { SquareCard } from "@/components/ui";
import { DashboardHomeGauge } from "@/components/dashboard/dashboard-home-gauge";
import { DashboardPrepSummary } from "@/components/dashboard/dashboard-prep-summary";
import type { PrepProductSummary } from "@/lib/dashboard-prep-summary";

const center = "text-center";
const homeStack = "mx-auto w-full max-w-[360px]";

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
    <SquareCard className="bakery-float-tile flex h-full min-h-[112px] w-full flex-col items-center justify-center gap-2 rounded-[20px] p-4 text-center">
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
  showOrders,
  showAppointments,
  ordersHref = "/dashboard/settings/orders",
  appointmentsHref = "/dashboard/appointments",
  inquiriesHref = "/dashboard/customers/inquiries",
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
  showOrders: boolean;
  showAppointments: boolean;
  ordersHref?: string;
  appointmentsHref?: string;
  inquiriesHref?: string;
  prepProducts?: PrepProductSummary[];
  showPrepSummary?: boolean;
}) {
  const statItems = [
    showOrders && {
      key: "orders",
      label: "הזמנות ממתינות",
      value: pendingOrders ?? 0,
      action: (
        <Link
          href={ordersHref}
          className="text-[14px] font-bold text-bakery-primary"
        >
          ניהול הזמנות
        </Link>
      ),
    },
    showAppointments && {
      key: "appointments",
      label: "תורים ממתינים",
      value: pendingAppointments ?? 0,
      action: (
        <Link
          href={appointmentsHref}
          className="text-[14px] font-bold text-bakery-primary"
        >
          ניהול תורים
        </Link>
      ),
    },
    {
      key: "inquiries",
      label: "פניות",
      value: inquiries,
      action: (
        <Link
          href={inquiriesHref}
          className="text-[14px] font-bold text-bakery-primary"
        >
          צפייה בפניות
        </Link>
      ),
    },
  ].filter(Boolean) as {
    key: string;
    label: string;
    value: number;
    action: ReactNode;
  }[];

  return (
    <div className={`flex min-h-[min(72dvh,560px)] flex-col items-center gap-4 sm:gap-5 ${center}`}>
      <div className={homeStack}>
        <HomePageTitle>{businessName}</HomePageTitle>
      </div>

      <DashboardHomeGauge percent={100} />

      {showPrepSummary && prepProducts && (
        <div className={homeStack}>
          <DashboardPrepSummary initialProducts={prepProducts} />
        </div>
      )}

      <div className={`${homeStack} grid grid-cols-2 gap-3`}>
        {statItems.map((item, index) => (
          <div
            key={item.key}
            className={
              statItems.length % 2 === 1 && index === statItems.length - 1
                ? "col-span-2 flex justify-center"
                : "min-w-0"
            }
          >
            <div
              className={
                statItems.length % 2 === 1 && index === statItems.length - 1
                  ? "w-[calc(50%-0.375rem)]"
                  : "w-full"
              }
            >
              <StatCard
                label={item.label}
                value={item.value}
                action={item.action}
              />
            </div>
          </div>
        ))}
      </div>

      <div className={`${homeStack} mt-auto pt-2`}>
        <SquareCard
          className={`bakery-float-tile w-full rounded-[22px] px-4 py-3.5 ${center}`}
        >
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
        </SquareCard>
      </div>
    </div>
  );
}
