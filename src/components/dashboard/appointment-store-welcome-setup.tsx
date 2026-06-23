"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { DashboardAppointmentsCalendarSettings } from "@/components/dashboard/dashboard-appointments-calendar-settings";
import { ProductsManager } from "@/components/dashboard/products-manager";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { DASHBOARD_MOBILE_STACK } from "@/components/dashboard/dashboard-panel-frame";
import {
  isAppointmentStoreScheduleConfigured,
  isAppointmentStoreServicesConfigured,
} from "@/lib/appointment-store-setup";
import { SELLER_WELCOME_GUIDE_ENABLED } from "@/lib/seller-welcome-guide-enabled";
import { isScheduleLikeBusinessType } from "@/lib/types";

function readWelcomeFromUrl() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("welcome") === "1";
}

export function AppointmentStoreWelcomeSetup({
  businessType,
  basePath = "/dashboard",
  orderScheduleEnabled = false,
  orderSchedule = null,
}: {
  businessId: string;
  businessType: string;
  basePath?: string;
  orderScheduleEnabled?: boolean;
  orderSchedule?: string | null;
}) {
  const router = useRouter();
  const { labels } = useAppLocale();
  const [welcome, setWelcome] = useState(false);
  const [activeServiceCount, setActiveServiceCount] = useState(0);
  const scheduleConfigured = useMemo(
    () =>
      isAppointmentStoreScheduleConfigured({
        businessType,
        orderScheduleEnabled,
        orderSchedule,
      }),
    [businessType, orderScheduleEnabled, orderSchedule]
  );
  const servicesConfigured = isAppointmentStoreServicesConfigured(activeServiceCount);
  const setupComplete = scheduleConfigured && servicesConfigured;
  const required = !setupComplete;
  const [open, setOpen] = useState(required);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const serviceSaveRef = useRef<(() => Promise<boolean>) | null>(null);
  const scheduleSaveRef = useRef<(() => Promise<boolean>) | null>(null);
  const calendarSaveRef = useRef<(() => Promise<boolean>) | null>(null);

  useEffect(() => {
    setWelcome(readWelcomeFromUrl());
  }, []);

  useEffect(() => {
    if (!isScheduleLikeBusinessType(businessType)) return;
    setOpen(!setupComplete);
  }, [businessType, setupComplete]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const finish = useCallback(() => {
    setOpen(false);
    if (welcome) {
      router.replace(basePath);
    }
    router.refresh();
  }, [welcome, router, basePath]);

  const handleContinue = useCallback(async () => {
    setSaveError("");
    setSaving(true);
    try {
      const serviceOk = serviceSaveRef.current
        ? await serviceSaveRef.current()
        : true;
      if (!serviceOk) {
        setSaveError(labels.appointmentStoreSetupNeedService);
        return;
      }
      const scheduleOk = scheduleSaveRef.current
        ? await scheduleSaveRef.current()
        : true;
      if (!scheduleOk) {
        setSaveError(labels.saveError);
        return;
      }
      const calendarOk = calendarSaveRef.current
        ? await calendarSaveRef.current()
        : true;
      if (!calendarOk) {
        setSaveError(labels.saveError);
        return;
      }
      finish();
    } finally {
      setSaving(false);
    }
  }, [
    finish,
    labels.appointmentStoreSetupNeedService,
    labels.saveError,
  ]);

  if (!isScheduleLikeBusinessType(businessType) || !open) return null;

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-bakery-ink/55 p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-store-setup-title"
    >
      <div
        className={`dashboard-surface dashboard-card bakery-action-sheet-panel dashboard-appointments-calendar-sheet appointment-store-welcome-setup ${DASHBOARD_MOBILE_STACK} flex max-h-[min(calc(100dvh-1.5rem),760px)] w-full flex-col overflow-hidden rounded-[28px] shadow-[var(--shadow-bakery-panel)]`}
      >
        <div className="shrink-0 border-b border-bakery-border/25 px-4 py-3 text-center">
          <h2
            id="appointment-store-setup-title"
            className="text-[18px] font-extrabold text-bakery-ink"
          >
            {labels.appointmentStoreSetupTitle}
          </h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-4 text-start">
            <p className="text-[14px] font-semibold leading-[1.55] text-bakery-muted">
              {labels.appointmentStoreSetupIntro}
            </p>

            <ProductsManager
              inline
              welcomeSetup
              mode="services"
              saveHandleRef={serviceSaveRef}
              onProductsChange={(items) => {
                setActiveServiceCount(
                  items.filter((item) => item.isActive).length
                );
              }}
            />

            <DashboardAppointmentsCalendarSettings
              inline
              welcomeSetup
              hideDurationField
              saveHandleRef={calendarSaveRef}
              scheduleSaveHandleRef={scheduleSaveRef}
              basePath={basePath}
              workingDays={{
                initialEnabled: orderScheduleEnabled,
                initialScheduleJson: orderSchedule,
              }}
            />

            {saveError ? (
              <p className="rounded-full border border-[#b85c5c]/35 bg-[#faf0ee] px-4 py-2 text-center text-[13px] font-bold text-[#9a4545]">
                {saveError}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 justify-center border-t border-bakery-border/20 px-4 py-3">
          <Button
            type="button"
            className="bakery-cta-3d bakery-cta-3d--primary mx-auto w-full min-h-[48px] max-w-[min(100%,20rem)] !rounded-full !shadow-none font-extrabold hover:!opacity-100"
            disabled={saving}
            onClick={() => void handleContinue()}
          >
            {saving
              ? labels.saving
              : welcome && SELLER_WELCOME_GUIDE_ENABLED
                ? labels.appointmentStoreSetupContinue
                : labels.save}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
