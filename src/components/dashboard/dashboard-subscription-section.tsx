"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import {
  DashboardSettingsTile,
  DashboardSettingsTileRow,
} from "@/components/dashboard/dashboard-settings-tile";
import { DASHBOARD_SETTINGS_ACTION } from "@/components/dashboard/dashboard-settings-bar";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import {
  formatPlanPrice,
  planPrice,
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from "@/lib/subscription-plans";
import type { DashboardLabels } from "@/lib/app-locale";

function featureLabel(labels: DashboardLabels, key: string): string {
  switch (key) {
    case "subscriptionPremiumFeature1":
      return labels.subscriptionPremiumFeature1;
    case "subscriptionPremiumFeature2":
      return labels.subscriptionPremiumFeature2;
    case "subscriptionPremiumFeature3":
      return labels.subscriptionPremiumFeature3;
    case "subscriptionUltimateFeature1":
      return labels.subscriptionUltimateFeature1;
    case "subscriptionUltimateFeature2":
      return labels.subscriptionUltimateFeature2;
    case "subscriptionUltimateFeature3":
      return labels.subscriptionUltimateFeature3;
    default:
      return "";
  }
}

export function DashboardSubscriptionSection({
  previewOnly = false,
}: {
  previewOnly?: boolean;
}) {
  const { labels, locale } = useAppLocale();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  function choosePlan(planId: SubscriptionPlanId) {
    if (previewOnly) {
      setMessage(labels.subscriptionPreviewOnly);
      setTimeout(() => setMessage(""), 2800);
      return;
    }
    setMessage(labels.subscriptionComingSoon);
    setTimeout(() => setMessage(""), 2800);
  }

  return (
    <>
      <DashboardSettingsTile>
        <button
          type="button"
          className="w-full text-start transition active:opacity-90"
          onClick={() => {
            setMessage("");
            setOpen(true);
          }}
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

      <DashboardActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title={labels.subscriptionPlansTitle}
        ariaLabel={labels.subscriptionPlansTitle}
        placement="center"
        showBackButton
      >
        <div className="space-y-4 text-center">
          <p className="text-[14px] font-semibold leading-relaxed text-bakery-muted">
            {labels.subscriptionPlansHint}
          </p>

          <div className="space-y-3">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const title =
                plan.id === "premium"
                  ? labels.subscriptionPremium
                  : labels.subscriptionUltimate;
              const price = formatPlanPrice(planPrice(plan, locale), locale);

              return (
                <div
                  key={plan.id}
                  className="rounded-[22px] border border-bakery-border/40 bg-[#F2EBE0] px-4 py-4 text-center"
                >
                  <p className="text-[18px] font-extrabold text-bakery-ink">
                    {title}
                  </p>
                  <p className="mt-1 flex items-baseline justify-center gap-1">
                    <span
                      className="text-[28px] font-extrabold tabular-nums text-bakery-primary"
                      dir="ltr"
                    >
                      {price}
                    </span>
                    <span className="text-[13px] font-bold text-bakery-muted">
                      {labels.subscriptionPerMonth}
                    </span>
                  </p>
                  <ul className="mt-3 space-y-1.5 text-[13px] font-semibold leading-snug text-bakery-ink">
                    {plan.featureKeys.map((key) => (
                      <li key={key}>{featureLabel(labels, key)}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    className="bakery-cta-3d bakery-cta-3d--primary mt-4 w-full !rounded-full !py-3 text-[15px] font-extrabold"
                    onClick={() => choosePlan(plan.id)}
                  >
                    {labels.subscriptionChoose}
                  </button>
                </div>
              );
            })}
          </div>

          {message ? (
            <p className="text-[13px] font-semibold text-bakery-muted">{message}</p>
          ) : null}
        </div>
      </DashboardActionSheet>
    </>
  );
}
