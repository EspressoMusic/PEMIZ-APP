"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { DashboardActionRowButton } from "@/components/dashboard/dashboard-action-row";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import {
  DashboardSettingsTile,
  DashboardSettingsTileRow,
} from "@/components/dashboard/dashboard-settings-tile";
import { DASHBOARD_SETTINGS_ACTION } from "@/components/dashboard/dashboard-settings-bar";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  parseSubscriptionPlanId,
  type SubscriptionPlanId,
} from "@/lib/subscription-plans";
import type { DashboardLabels } from "@/lib/app-locale";
import { useSubscriptionCheckout } from "@/components/dashboard/use-subscription-checkout";
import { useSubscriptionPortal } from "@/components/dashboard/use-subscription-portal";
import { DashboardSubscriptionPlanPicker } from "@/components/dashboard/dashboard-subscription-plan-picker";

type SubscriptionStatusResponse = {
  trial: {
    daysRemaining: number;
    expired: boolean;
    hasSubscription: boolean;
    trialEndsAt: string;
    bypassed: boolean;
  };
  usage: {
    hasSubscription: boolean;
    limit: number | null;
    used: number;
    remaining: number | null;
    periodEnd: string;
  };
  subscriptionPlan: string | null;
  subscriptionActiveAt: string | null;
  paymentsEnabled: boolean;
  providerConfigured: boolean;
  billingPortalAvailable: boolean;
};

/** Subscription activation is live; requires Paddle env vars + SUBSCRIPTION_PAYMENTS_ENABLED=true on the server. */
const SUBSCRIPTION_ACTIVATION_ENABLED = true;

function planTitle(labels: DashboardLabels, planId: SubscriptionPlanId): string {
  return planId === "premium"
    ? labels.subscriptionPremium
    : labels.subscriptionUltimate;
}

function formatDate(iso: string, locale: "he" | "en") {
  return new Date(iso).toLocaleDateString(locale === "he" ? "he-IL" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function SubscriptionStatusPanel({
  status,
  labels,
  locale,
  openingPortal,
  onManageBilling,
}: {
  status: SubscriptionStatusResponse;
  labels: DashboardLabels;
  locale: "he" | "en";
  openingPortal: boolean;
  onManageBilling: () => void;
}) {
  const activePlanId = parseSubscriptionPlanId(status.subscriptionPlan);
  const hasActiveSubscription = Boolean(status.subscriptionActiveAt);

  return (
    <div className="dashboard-subscription-panel rounded-[22px] border border-bakery-border/40 px-4 py-4 text-center">
      <p className="text-[13px] font-extrabold uppercase tracking-wide text-bakery-muted">
        {labels.subscriptionStatusTitle}
      </p>

      {hasActiveSubscription && activePlanId ? (
        <>
          <p className="mt-2 text-[18px] font-extrabold text-bakery-ink">
            {labels.subscriptionActivePlan}: {planTitle(labels, activePlanId)}
          </p>
          {status.usage.periodEnd ? (
            <p className="mt-1 text-[13px] font-semibold text-bakery-muted">
              {labels.subscriptionRenewsOn}{" "}
              <span dir="ltr" className="font-bold text-bakery-ink">
                {formatDate(status.usage.periodEnd, locale)}
              </span>
            </p>
          ) : null}
        </>
      ) : status.trial.bypassed ? (
        <p className="mt-2 text-[13px] font-semibold leading-relaxed text-bakery-muted">
          {labels.subscriptionNoBillingYet}
        </p>
      ) : status.trial.expired ? (
        <p className="mt-2 text-[15px] font-extrabold text-bakery-sale">
          {labels.subscriptionTrialExpiredShort}
        </p>
      ) : (
        <p className="mt-2 text-[15px] font-extrabold text-bakery-ink">
          {labels.subscriptionTrialRemaining}:{" "}
          <span dir="ltr">{status.trial.daysRemaining}</span>
        </p>
      )}

      {status.usage.limit !== null ? (
        <p className="mt-3 text-[13px] font-semibold text-bakery-muted">
          {labels.subscriptionUsageThisMonth}:{" "}
          <span dir="ltr" className="font-bold text-bakery-ink">
            {status.usage.used} {labels.subscriptionUsageOf} {status.usage.limit}
          </span>
        </p>
      ) : null}

      {status.billingPortalAvailable ? (
        <button
          type="button"
          disabled={openingPortal}
          className="bakery-cta-3d bakery-cta-3d--primary mt-4 w-full !rounded-full !py-3 text-[15px] font-extrabold disabled:opacity-60"
          onClick={onManageBilling}
        >
          {openingPortal ? labels.saving : labels.subscriptionManageBilling}
        </button>
      ) : !hasActiveSubscription ? (
        <p className="mt-3 text-[13px] font-semibold leading-relaxed text-bakery-muted">
          {labels.subscriptionNoBillingYet}
        </p>
      ) : null}
    </div>
  );
}

export function DashboardSubscriptionSection({
  previewOnly = false,
  embedded = false,
}: {
  previewOnly?: boolean;
  /** Inside the shared settings panel — same row style as customers / alerts. */
  embedded?: boolean;
}) {
  const { labels, locale } = useAppLocale();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<SubscriptionStatusResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const { payingPlan, message, setMessage, startCheckout } =
    useSubscriptionCheckout();
  const { openingPortal, openBillingPortal } = useSubscriptionPortal();

  useEffect(() => {
    if (!open || previewOnly) return;
    let cancelled = false;
    setStatusLoading(true);
    void fetch("/api/dashboard/subscription/status")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data && !data.error) {
          setStatus(data as SubscriptionStatusResponse);
        }
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, previewOnly]);

  function choosePlan(planId: SubscriptionPlanId) {
    if (previewOnly || !SUBSCRIPTION_ACTIVATION_ENABLED) return;
    void startCheckout(planId, labels.subscriptionComingSoon);
  }

  async function manageBilling() {
    if (previewOnly) return;
    setMessage("");
    const result = await openBillingPortal(labels.subscriptionPortalError);
    if (!result.ok) {
      setMessage(result.message);
    }
  }

  const hasActiveSubscription = Boolean(status?.subscriptionActiveAt);
  const showPlanPicker = !hasActiveSubscription;

  function openSubscriptionSheet() {
    setMessage("");
    setOpen(true);
  }

  return (
    <>
      {embedded ? (
        <DashboardActionRowButton
          onClick={openSubscriptionSheet}
          icon={Crown}
          title={labels.subscription}
        />
      ) : (
        <DashboardSettingsTile>
          <button
            type="button"
            className="w-full text-start transition active:opacity-90"
            onClick={openSubscriptionSheet}
          >
            <DashboardSettingsTileRow
              panel={
                <p className="text-[15px] font-extrabold text-bakery-ink">
                  {labels.subscription}
                </p>
              }
              leading={
                <span
                  className={`${DASHBOARD_SETTINGS_ACTION} w-10 border border-bakery-border/35 bg-bakery-card/60 text-bakery-primary`}
                  aria-hidden
                >
                  <Crown className="h-4 w-4" strokeWidth={2.1} />
                </span>
              }
            />
          </button>
        </DashboardSettingsTile>
      )}

      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={labels.subscriptionPlansTitle}
        ariaLabel={labels.subscriptionPlansTitle}
        placement="center"
        showBackButton
      >
        <div className="space-y-4 text-center">
          {!previewOnly && statusLoading ? (
            <p className="text-[13px] font-semibold text-bakery-muted">
              {labels.chatLoading}
            </p>
          ) : null}

          {!previewOnly && status && !statusLoading ? (
            <SubscriptionStatusPanel
              status={status}
              labels={labels}
              locale={locale}
              openingPortal={openingPortal}
              onManageBilling={() => void manageBilling()}
            />
          ) : null}

          {showPlanPicker || previewOnly ? (
            <DashboardSubscriptionPlanPicker
                locale={locale}
                labels={labels}
                payingPlan={payingPlan}
                previewOnly={previewOnly}
                activationUnavailable={!previewOnly && !SUBSCRIPTION_ACTIVATION_ENABLED}
                onChoosePlan={choosePlan}
                onActivationUnavailable={() =>
                  setMessage(labels.subscriptionActivationUnavailable)
                }
              />
          ) : null}

          {message ? (
            <p className="text-[13px] font-semibold text-bakery-muted">{message}</p>
          ) : null}
        </div>
      </DashboardActionSheet>
    </>
  );
}
