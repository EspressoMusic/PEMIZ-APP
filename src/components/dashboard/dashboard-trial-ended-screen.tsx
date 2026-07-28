"use client";

import { Panel, PageTitle } from "@/components/ui";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DashboardOrdersList, type DashboardOrderView } from "@/components/dashboard/dashboard-order-card";
import { DashboardTrialEndedModal } from "@/components/dashboard/dashboard-trial-ended-modal";
import { DashboardTrialPaywall } from "@/components/dashboard/dashboard-trial-paywall";

const SUBSCRIPTION_ANCHOR_ID = "trial-expired-subscription-panel";

export function DashboardTrialEndedScreen({
  trialEndsAt,
  businessName,
  recentOrders,
  showRecentOrders,
  previewOnly = false,
  modalMessage,
}: {
  trialEndsAt: string;
  businessName?: string;
  recentOrders: DashboardOrderView[];
  /** false for business types that don't have an Order model (e.g. appointments-only). */
  showRecentOrders: boolean;
  previewOnly?: boolean;
  modalMessage: string;
}) {
  const { labels } = useAppLocale();

  return (
    <div className="space-y-4">
      <DashboardTrialEndedModal
        message={modalMessage}
        subscriptionAnchorId={SUBSCRIPTION_ANCHOR_ID}
      />

      {showRecentOrders ? (
        <Panel>
          <PageTitle subtitle={labels.trialExpiredRecentOrdersHint}>
            {labels.trialExpiredRecentOrdersTitle}
          </PageTitle>
          <DashboardOrdersList orders={recentOrders} showPrices />
        </Panel>
      ) : null}

      <div id={SUBSCRIPTION_ANCHOR_ID}>
        <DashboardTrialPaywall
          trialEndsAt={trialEndsAt}
          businessName={businessName}
          previewOnly={previewOnly}
        />
      </div>
    </div>
  );
}
