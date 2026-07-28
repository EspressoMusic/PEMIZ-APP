import type { Metadata } from "next";
import { AppLocaleProvider } from "@/components/dashboard/app-locale-provider";
import { DashboardTrialEndedScreen } from "@/components/dashboard/dashboard-trial-ended-screen";
import { WebShell } from "@/components/web-shell";
import type { DashboardOrderView } from "@/components/dashboard/dashboard-order-card";
import { trialEndedPopupMessage } from "@/lib/trial-warnings";

export const metadata: Metadata = {
  title: "Trial expired preview — Peymiz",
  robots: { index: false, follow: false },
};

const SAMPLE_ORDERS: DashboardOrderView[] = [
  {
    id: "sample-order-1",
    orderNumber: 1042,
    customerName: "מאיה ברק",
    customerPhone: "050-1234567",
    status: "CONFIRMED",
    statusLabel: "אושרה",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    items: [
      { name: "עוגת שוקולד", quantity: 1, lineTotal: 120, imageUrl: null },
    ],
  },
  {
    id: "sample-order-2",
    orderNumber: 1041,
    customerName: "דני לוי",
    customerPhone: "052-9876543",
    status: "COMPLETED",
    statusLabel: "הושלמה",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    items: [
      { name: "מארז מאפינס", quantity: 2, lineTotal: 90, imageUrl: null },
    ],
  },
];

export default function PreviewTrialExpiredPage() {
  const trialEndsAt = new Date(
    Date.now() - 2 * 24 * 60 * 60 * 1000
  ).toISOString();

  return (
    <AppLocaleProvider initialLocale="he">
      <WebShell lockViewport>
        <div className="mx-auto w-full max-w-lg px-4 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:py-10">
          <DashboardTrialEndedScreen
            trialEndsAt={trialEndsAt}
            businessName="חנות לדוגמה"
            recentOrders={SAMPLE_ORDERS}
            showRecentOrders
            previewOnly
            modalMessage={trialEndedPopupMessage()}
          />
        </div>
      </WebShell>
    </AppLocaleProvider>
  );
}
