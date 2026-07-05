"use client";

import { AppLocaleProvider } from "@/components/dashboard/app-locale-provider";
import { DashboardSubscriptionPlanPicker } from "@/components/dashboard/dashboard-subscription-plan-picker";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";

function SubscriptionPreviewBody() {
  const { labels, locale } = useAppLocale();

  return (
    <div className="dashboard-surface bakery-frame-bg mx-auto min-h-dvh max-w-md px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <p className="mb-2 text-center text-[13px] font-bold text-bakery-muted">
        תצוגה מקדימה — מסך מנוי
      </p>
      <h1 className="mb-4 text-center text-[22px] font-extrabold text-bakery-ink">
        {labels.subscriptionPlansTitle}
      </h1>
      <p className="mb-4 text-center text-[14px] font-semibold leading-relaxed text-bakery-muted">
        {labels.subscriptionPlansHint}
      </p>
      <DashboardSubscriptionPlanPicker
        locale={locale}
        labels={labels}
        payingPlan={null}
        previewOnly
        onChoosePlan={() => {}}
      />
    </div>
  );
}

export function SubscriptionPreviewDemo() {
  return (
    <AppLocaleProvider initialLocale="he">
      <SubscriptionPreviewBody />
    </AppLocaleProvider>
  );
}
