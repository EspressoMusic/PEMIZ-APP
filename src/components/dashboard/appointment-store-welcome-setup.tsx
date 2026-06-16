"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { DashboardActionSheet } from "@/components/dashboard/dashboard-action-sheet";
import { DashboardAppointmentsCalendarSettings } from "@/components/dashboard/dashboard-appointments-calendar-settings";
import { useAppLocale } from "@/components/dashboard/app-locale-provider";
import { isScheduleLikeBusinessType } from "@/lib/types";

const STORAGE_PREFIX = "linky_appointments_setup_done:";

function storageKey(businessId: string) {
  return `${STORAGE_PREFIX}${businessId}`;
}

function AppointmentStoreWelcomeSetupInner({
  businessId,
  businessType,
  basePath = "/dashboard",
}: {
  businessId: string;
  businessType: string;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { labels } = useAppLocale();
  const welcome = searchParams.get("welcome") === "1";
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const scheduleSaveRef = useRef<(() => Promise<boolean>) | null>(null);
  const calendarSaveRef = useRef<(() => Promise<boolean>) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isScheduleLikeBusinessType(businessType)) return;
    if (!welcome) return;
    if (localStorage.getItem(storageKey(businessId)) === "1") return;
    setOpen(true);
  }, [businessId, businessType, welcome]);

  const dismiss = useCallback(() => {
    localStorage.setItem(storageKey(businessId), "1");
    setOpen(false);
    if (welcome) {
      router.replace(basePath);
    }
  }, [businessId, welcome, router, basePath]);

  const handleContinue = useCallback(async () => {
    setSaveError("");
    setSaving(true);
    try {
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
      dismiss();
    } finally {
      setSaving(false);
    }
  }, [dismiss, labels.saveError]);

  if (!isScheduleLikeBusinessType(businessType)) return null;

  return (
    <DashboardActionSheet
      open={open}
      onClose={dismiss}
      title={labels.appointmentStoreSetupTitle}
      ariaLabel={labels.appointmentStoreSetupTitle}
      placement="center"
      expanded
      elevated
      compact
    >
      <div className="space-y-5 pb-2 text-start">
        <p className="text-[14px] font-semibold leading-[1.55] text-bakery-muted">
          {labels.appointmentStoreSetupIntro}
        </p>

        <DashboardAppointmentsCalendarSettings
          inline
          saveHandleRef={calendarSaveRef}
          scheduleSaveHandleRef={scheduleSaveRef}
          workingDays={{
            initialEnabled: false,
            initialScheduleJson: null,
          }}
        />

        {saveError ? (
          <p className="rounded-full border border-[#b85c5c]/35 bg-[#faf0ee] px-4 py-2 text-center text-[13px] font-bold text-[#9a4545]">
            {saveError}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 pt-1">
          <Button
            type="button"
            className="w-full min-h-[44px] rounded-full font-extrabold"
            disabled={saving}
            onClick={() => void handleContinue()}
          >
            {saving ? labels.saving : labels.appointmentStoreSetupContinue}
          </Button>
          <button
            type="button"
            onClick={dismiss}
            className="min-h-[40px] text-[14px] font-bold text-bakery-muted transition hover:text-bakery-ink"
          >
            {labels.sellerGuideSkip}
          </button>
        </div>
      </div>
    </DashboardActionSheet>
  );
}

export function AppointmentStoreWelcomeSetup({
  businessId,
  businessType,
  basePath = "/dashboard",
}: {
  businessId: string;
  businessType: string;
  basePath?: string;
}) {
  return (
    <Suspense fallback={null}>
      <AppointmentStoreWelcomeSetupInner
        businessId={businessId}
        businessType={businessType}
        basePath={basePath}
      />
    </Suspense>
  );
}
