"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useVisibilityInterval } from "@/hooks/use-visibility-interval";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { getDashboardLabels } from "@/lib/app-locale";
import {
  fetchLiveDashboardNotifications,
  loadPreviewDashboardNotifications,
} from "@/lib/dashboard-notifications-client";
import { resolveSellerNudgeMessage } from "@/lib/dashboard-seller-nudge";
import type { BusinessType } from "@/lib/types";

export function DashboardSellerNudge({
  previewOnly = false,
  businessType = "STORE",
}: {
  businessSlug?: string;
  previewOnly?: boolean;
  businessType?: BusinessType;
}) {
  const { locale } = useAppLocale();

  const previewMessage = useMemo(() => {
    if (!previewOnly) return null;
    const notifications = loadPreviewDashboardNotifications(businessType, locale);
    return resolveSellerNudgeMessage(
      notifications,
      getDashboardLabels(locale),
      { previewDemo: true }
    );
  }, [previewOnly, businessType, locale]);

  const [liveMessage, setLiveMessage] = useState<string | null>(null);

  const loadLive = useCallback(async () => {
    if (previewOnly) return;
    const notifications = await fetchLiveDashboardNotifications(businessType);
    setLiveMessage(
      resolveSellerNudgeMessage(notifications, getDashboardLabels(locale))
    );
  }, [previewOnly, businessType, locale]);

  useEffect(() => {
    void loadLive();
  }, [loadLive]);

  useVisibilityInterval(() => void loadLive(), 20_000, 45_000, !previewOnly);

  const message = previewOnly ? previewMessage : liveMessage;

  if (!message) return null;

  return (
    <p className="dashboard-seller-nudge mt-1 w-full px-12 text-center text-[13px] font-semibold leading-snug text-bakery-muted">
      {message}
    </p>
  );
}
